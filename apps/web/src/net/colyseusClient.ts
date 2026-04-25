"use client";

import { Client, Room } from "colyseus.js";
import type { MatchState } from "@loot-rush/shared";

const endpoint = process.env.NEXT_PUBLIC_GAME_SERVER_WS ?? "ws://localhost:2567";

export async function joinLootRushRoom(playerId: string): Promise<Room<MatchState>> {
  const client = new Client(endpoint);
  const room = await client.joinOrCreate<MatchState>("loot_rush_room", { playerId });
  return room;
}
