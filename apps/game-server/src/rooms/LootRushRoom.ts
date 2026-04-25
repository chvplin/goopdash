import { Room } from "colyseus";
import type { InputFrame, MatchState, PlayerState, Team } from "@loot-rush/shared";
import {
  BASE_SPEED,
  DASH_COOLDOWN_MS,
  DASH_DURATION_MS,
  DASH_SPEED,
  MATCH_DURATION_MS,
  PICKUP_LOCK_MS,
  PLAYER_RADIUS,
  SERVER_TICK_RATE,
  STUN_MS
} from "../sim/constants";
import { createSeedLoot } from "../sim/loot";
import { canPickup, validateInputShape } from "../antiCheat/validators";
import { resolveCircleVsAabb, type RectObstacle } from "../sim/collision";

type ClientInput = InputFrame;

const ARENA = { minX: -30, maxX: 30, minY: -20, maxY: 20 };
const OBSTACLES: RectObstacle[] = [
  { x: -9, y: -6, width: 3, height: 6 },
  { x: 8, y: 7, width: 4, height: 3 },
  { x: 0, y: -9, width: 10, height: 2 }
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export class LootRushRoom extends Room<MatchState> {
  maxClients = 10;
  private startedAt = 0;

  onCreate() {
    this.setState({
      roomId: this.roomId,
      phase: "waiting",
      blueScore: 0,
      redScore: 0,
      timeRemainingMs: MATCH_DURATION_MS,
      players: {},
      lootPool: createSeedLoot()
    });

    this.onMessage("input", (client, input: ClientInput) => {
      const player = this.state.players[client.sessionId];
      if (!player || !validateInputShape(input)) {
        return;
      }
      this.processInput(player, input);
    });

    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / SERVER_TICK_RATE);
  }

  onJoin(client: any) {
    const team: Team = Object.keys(this.state.players).length % 2 === 0 ? "blue" : "red";
    const spawnX = team === "blue" ? -24 : 24;
    const spawnY = (Object.keys(this.state.players).length % 5) * 2 - 4;
    this.state.players[client.sessionId] = {
      id: client.sessionId,
      team,
      position: { x: spawnX, y: spawnY },
      velocity: { x: 0, y: 0 },
      facingYaw: 0,
      baseSpeed: BASE_SPEED,
      currentSpeed: BASE_SPEED,
      isDashing: false,
      dashCooldownMs: 0,
      dashEndsAt: 0,
      isStunnedUntil: 0,
      carriedLootId: null,
      radius: PLAYER_RADIUS,
      lastProcessedInputSeq: 0
    };

    if (Object.keys(this.state.players).length === 10 && this.state.phase === "waiting") {
      this.state.phase = "active";
      this.startedAt = Date.now();
    }
  }

  onLeave(client: any) {
    delete this.state.players[client.sessionId];
  }

  private processInput(player: PlayerState, input: ClientInput) {
    const now = Date.now();
    player.lastProcessedInputSeq = input.seq;
    if (now < player.isStunnedUntil) {
      return;
    }

    const hasLoot = player.carriedLootId ? this.state.lootPool[player.carriedLootId] : null;
    const lootSpeedPenalty = hasLoot ? hasLoot.weight * 0.35 : 0;
    const speed = Math.max(3.5, BASE_SPEED - lootSpeedPenalty);
    const dashing = input.dashPressed && now >= player.dashCooldownMs;
    const currentSpeed = dashing ? DASH_SPEED : speed;

    if (dashing) {
      player.isDashing = true;
      player.dashEndsAt = now + DASH_DURATION_MS;
      player.dashCooldownMs = now + DASH_COOLDOWN_MS;
    }

    player.velocity = { x: input.move.x * currentSpeed, y: input.move.y * currentSpeed };

    if (input.pickupPressed && !player.carriedLootId) {
      const loot = (Object.values(this.state.lootPool) as Array<MatchState["lootPool"][string]>).find(
        (item) =>
          !item.deposited &&
          !item.carriedByPlayerId &&
          now >= item.isPickupLockedUntil &&
          canPickup(player.position.x, player.position.y, item.position.x, item.position.y)
      );
      if (loot) {
        loot.carriedByPlayerId = player.id;
        player.carriedLootId = loot.id;
      }
    }
  }

  private update(deltaTime: number) {
    if (this.state.phase !== "active") {
      return;
    }
    const now = Date.now();
    this.state.timeRemainingMs = Math.max(0, MATCH_DURATION_MS - (now - this.startedAt));
    if (this.state.timeRemainingMs <= 0) {
      this.state.phase = "ended";
      this.broadcast("match:ended", {
        blueScore: this.state.blueScore,
        redScore: this.state.redScore,
        winningTeam: this.state.blueScore >= this.state.redScore ? "blue" : "red"
      });
      this.disconnect();
      return;
    }

    const dt = deltaTime / 1000;
    const players = Object.values(this.state.players) as Array<MatchState["players"][string]>;

    for (const player of players) {
      if (player.isDashing && now > player.dashEndsAt) {
        player.isDashing = false;
      }

      player.position.x = clamp(player.position.x + player.velocity.x * dt, ARENA.minX, ARENA.maxX);
      player.position.y = clamp(player.position.y + player.velocity.y * dt, ARENA.minY, ARENA.maxY);
      for (const obstacle of OBSTACLES) {
        player.position = resolveCircleVsAabb(player.position, player.radius, obstacle);
      }

      if (player.carriedLootId) {
        const loot = this.state.lootPool[player.carriedLootId];
        if (loot) {
          loot.position = { ...player.position };
        }
        const inBlueBank = player.team === "blue" && player.position.x <= -26;
        const inRedBank = player.team === "red" && player.position.x >= 26;
        if (loot && (inBlueBank || inRedBank) && !loot.deposited) {
          loot.deposited = true;
          loot.carriedByPlayerId = null;
          player.carriedLootId = null;
          if (player.team === "blue") this.state.blueScore += loot.value;
          if (player.team === "red") this.state.redScore += loot.value;
          this.broadcast("loot:deposited", { team: player.team, value: loot.value });
        }
      }
    }

    for (const attacker of players) {
      if (!attacker.isDashing) continue;
      for (const victim of players) {
        if (attacker.id === victim.id) continue;
        if (attacker.team === victim.team) continue;
        if (!victim.carriedLootId) continue;
        const dist = Math.hypot(attacker.position.x - victim.position.x, attacker.position.y - victim.position.y);
        if (dist <= attacker.radius + victim.radius + 0.5) {
          const loot = this.state.lootPool[victim.carriedLootId];
          victim.carriedLootId = null;
          victim.isStunnedUntil = now + STUN_MS;
          if (loot) {
            loot.carriedByPlayerId = null;
            loot.position = {
              x: clamp(victim.position.x + (victim.position.x - attacker.position.x) * 1.2, ARENA.minX, ARENA.maxX),
              y: clamp(victim.position.y + (victim.position.y - attacker.position.y) * 1.2, ARENA.minY, ARENA.maxY)
            };
            loot.isPickupLockedUntil = now + PICKUP_LOCK_MS;
          }
          this.broadcast("dash:steal", { attackerId: attacker.id, victimId: victim.id });
        }
      }
    }
  }
}
