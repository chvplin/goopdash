import type { LootState } from "@loot-rush/shared";

export function createSeedLoot(): Record<string, LootState> {
  const rows: LootState[] = [
    { id: "loot-cash", type: "cash_bundle", value: 100, weight: 1, position: { x: 0, y: 0 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "cash_bundle.glb" },
    { id: "loot-bag", type: "money_bag", value: 250, weight: 2, position: { x: -2, y: 1 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "money_bag.glb" },
    { id: "loot-gold", type: "gold_bar_stack", value: 500, weight: 3.5, position: { x: 2, y: -1 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "gold_bar_stack.glb" },
    { id: "loot-diamond", type: "diamond_case", value: 800, weight: 4, position: { x: 1.5, y: 2 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "diamond_case.glb" },
    { id: "loot-mystery", type: "mystery_crate", value: Math.floor(150 + Math.random() * 550), weight: 2.5, position: { x: -1.5, y: -2 }, carriedByPlayerId: null, deposited: false, isPickupLockedUntil: 0, modelRef: "mystery_crate.glb" }
  ];
  return Object.fromEntries(rows.map((item) => [item.id, item]));
}
