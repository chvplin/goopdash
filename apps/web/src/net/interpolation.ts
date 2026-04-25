import type { Vec2 } from "@loot-rush/shared";

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export type Snapshot<T> = { timestamp: number; state: T };

export function interpolateSnapshot<T extends { position: Vec2 }>(
  older: Snapshot<T>,
  newer: Snapshot<T>,
  renderTime: number
): T {
  const total = Math.max(1, newer.timestamp - older.timestamp);
  const t = Math.max(0, Math.min(1, (renderTime - older.timestamp) / total));
  return {
    ...newer.state,
    position: lerpVec2(older.state.position, newer.state.position, t)
  };
}
