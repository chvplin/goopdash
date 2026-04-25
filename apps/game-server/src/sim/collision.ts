import type { Vec2 } from "@loot-rush/shared";

export type RectObstacle = { x: number; y: number; width: number; height: number };

export function resolveCircleVsAabb(position: Vec2, radius: number, obstacle: RectObstacle): Vec2 {
  const minX = obstacle.x - obstacle.width / 2;
  const maxX = obstacle.x + obstacle.width / 2;
  const minY = obstacle.y - obstacle.height / 2;
  const maxY = obstacle.y + obstacle.height / 2;
  const closestX = Math.max(minX, Math.min(position.x, maxX));
  const closestY = Math.max(minY, Math.min(position.y, maxY));
  const dx = position.x - closestX;
  const dy = position.y - closestY;
  const distSq = dx * dx + dy * dy;
  if (distSq >= radius * radius || distSq === 0) {
    return position;
  }
  const dist = Math.sqrt(distSq);
  const push = radius - dist;
  return {
    x: position.x + (dx / dist) * push,
    y: position.y + (dy / dist) * push
  };
}
