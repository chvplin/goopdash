import type { InputFrame, PlayerState } from "@loot-rush/shared";
import { DASH_COOLDOWN_MS, PICKUP_RANGE } from "../sim/constants";

export function validateInputShape(input: InputFrame): boolean {
  if (Math.abs(input.move.x) > 1 || Math.abs(input.move.y) > 1) {
    return false;
  }
  return Number.isFinite(input.seq) && Number.isFinite(input.timestamp);
}

export function canDash(now: number, player: PlayerState): boolean {
  return now >= player.dashCooldownMs + player.dashEndsAt - DASH_COOLDOWN_MS && now > player.isStunnedUntil;
}

export function canPickup(px: number, py: number, lx: number, ly: number): boolean {
  return Math.hypot(px - lx, py - ly) <= PICKUP_RANGE;
}
