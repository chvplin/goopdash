import { create } from "zustand";
import type { LootState, Team, Vec2 } from "@loot-rush/shared";

const arenaHalfWidth = 30;
const arenaHalfHeight = 20;

type LocalPlayer = {
  id: string;
  team: Team;
  position: Vec2;
  speed: number;
  carryingLootId: string | null;
  dashCooldownUntil: number;
};

type LocalGameStore = {
  player: LocalPlayer;
  loot: LootState[];
  blueScore: number;
  redScore: number;
  timerMs: number;
  tick: (deltaMs: number, input: Vec2, dashPressed: boolean, pickupPressed: boolean) => void;
};

const seedLoot = (): LootState[] => [
  { id: "l1", type: "cash_bundle", value: 100, weight: 1, position: { x: 0, y: 0 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "cash.glb" },
  { id: "l2", type: "money_bag", value: 250, weight: 2, position: { x: -3, y: 1 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "bag.glb" },
  { id: "l3", type: "gold_bar_stack", value: 500, weight: 3.5, position: { x: 3, y: -1 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "gold.glb" },
  { id: "l4", type: "diamond_case", value: 800, weight: 4, position: { x: 1, y: 2 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "diamond.glb" },
  { id: "l5", type: "mystery_crate", value: 350, weight: 2.5, position: { x: -2, y: -2 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "crate.glb" }
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useLocalGame = create<LocalGameStore>((set, get) => ({
  player: {
    id: "local-player",
    team: "blue",
    position: { x: -20, y: 0 },
    speed: 9,
    carryingLootId: null,
    dashCooldownUntil: 0
  },
  loot: seedLoot(),
  blueScore: 0,
  redScore: 0,
  timerMs: 180000,
  tick: (deltaMs, input, dashPressed, pickupPressed) => {
    const now = Date.now();
    const state = get();
    const dashSpeedBoost = dashPressed && now > state.player.dashCooldownUntil ? 8 : 0;
    const dashUsed = dashSpeedBoost > 0;
    const vx = input.x * (state.player.speed + dashSpeedBoost);
    const vy = input.y * (state.player.speed + dashSpeedBoost);
    const nextPosition = {
      x: clamp(state.player.position.x + (vx * deltaMs) / 1000, -arenaHalfWidth, arenaHalfWidth),
      y: clamp(state.player.position.y + (vy * deltaMs) / 1000, -arenaHalfHeight, arenaHalfHeight)
    };

    let carryingLootId = state.player.carryingLootId;
    const loot = state.loot.map((item) => ({ ...item }));

    if (pickupPressed && !carryingLootId) {
      const nearby = loot.find(
        (item) =>
          !item.deposited &&
          !item.carriedByPlayerId &&
          Math.hypot(item.position.x - nextPosition.x, item.position.y - nextPosition.y) < 2
      );
      if (nearby) {
        nearby.carriedByPlayerId = state.player.id;
        carryingLootId = nearby.id;
      }
    }

    if (carryingLootId) {
      const carried = loot.find((item) => item.id === carryingLootId);
      if (carried) {
        carried.position = { ...nextPosition };
      }

      const inBlueBank = nextPosition.x < -25;
      if (inBlueBank && carried && !carried.deposited) {
        carried.deposited = true;
        carried.carriedByPlayerId = null;
        carryingLootId = null;
        set((prev) => ({ blueScore: prev.blueScore + carried.value }));
      }
    }

    set((prev) => ({
      timerMs: Math.max(0, prev.timerMs - deltaMs),
      loot,
      player: {
        ...prev.player,
        position: nextPosition,
        carryingLootId,
        dashCooldownUntil: dashUsed ? now + 2500 : prev.player.dashCooldownUntil
      }
    }));
  }
}));
