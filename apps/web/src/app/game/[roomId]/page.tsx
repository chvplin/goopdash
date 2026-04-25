"use client";

import { ArenaScene } from "../../../game/ArenaScene";
import { GameHud } from "../../../ui/GameHud";

export default function GamePage() {
  return (
    <main style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <ArenaScene />
      <GameHud />
    </main>
  );
}
