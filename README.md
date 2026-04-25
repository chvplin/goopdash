# Loot Rush.io

Monorepo for a server-authoritative 5v5 browser multiplayer game.

## Apps
- apps/web: Next.js + React Three Fiber client
- apps/game-server: Colyseus realtime server
- packages/shared: shared gameplay/networking types
- infra/supabase: SQL schema and RLS policies

## Run locally
1. pnpm install
2. pnpm dev:server
3. pnpm dev:web

## Core networking rule
Client sends intent input only; game server is authoritative for movement, collision, loot state, scoring, and payouts.
