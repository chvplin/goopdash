import { createServer } from "http";
import express from "express";
import { Server } from "colyseus";
import { LootRushRoom } from "./rooms/LootRushRoom";

const port = Number(process.env.PORT ?? 2567);
const app = express();
app.get("/healthz", (_, res) => res.json({ ok: true, service: "loot-rush-game-server" }));

const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });

gameServer.define("loot_rush_room", LootRushRoom);

gameServer.listen(port);
console.log(`Loot Rush server listening on :${port}`);
