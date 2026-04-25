"use client";

import { useLocalGame } from "../game/localGame";

export function GameHud() {
  const { blueScore, redScore, timerMs, player } = useLocalGame();
  const timer = `${Math.floor(timerMs / 60000)}:${Math.floor((timerMs % 60000) / 1000)
    .toString()
    .padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", color: "#0d1b42" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: 12, fontWeight: 700 }}>
        <span>Blue: {blueScore}</span>
        <span>{timer}</span>
        <span>Red: {redScore}</span>
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16 }}>
        <div>Team: {player.team.toUpperCase()}</div>
        <div>Carry: {player.carryingLootId ?? "none"}</div>
        <div>Dash: {Math.max(0, Math.ceil((player.dashCooldownUntil - Date.now()) / 1000))}s</div>
        <div>Controls: WASD move, Shift dash, E pickup</div>
      </div>
    </div>
  );
}
