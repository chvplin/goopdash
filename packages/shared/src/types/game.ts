export type Team = "blue" | "red";
export type MatchPhase = "waiting" | "countdown" | "active" | "ended";

export type LootType =
  | "cash_bundle"
  | "money_bag"
  | "gold_bar_stack"
  | "diamond_case"
  | "mystery_crate";

export interface Vec2 {
  x: number;
  y: number;
}

export interface InputFrame {
  seq: number;
  timestamp: number;
  move: Vec2;
  pickupPressed: boolean;
  dashPressed: boolean;
}

export interface LootState {
  id: string;
  type: LootType;
  value: number;
  weight: number;
  position: Vec2;
  carriedByPlayerId: string | null;
  deposited: boolean;
  isPickupLockedUntil: number;
  modelRef: string;
}

export interface PlayerState {
  id: string;
  team: Team;
  position: Vec2;
  velocity: Vec2;
  facingYaw: number;
  baseSpeed: number;
  currentSpeed: number;
  isDashing: boolean;
  dashCooldownMs: number;
  dashEndsAt: number;
  isStunnedUntil: number;
  carriedLootId: string | null;
  radius: number;
  lastProcessedInputSeq: number;
}

export interface MatchState {
  roomId: string;
  phase: MatchPhase;
  blueScore: number;
  redScore: number;
  timeRemainingMs: number;
  players: Record<string, PlayerState>;
  lootPool: Record<string, LootState>;
}
