# Lisa — History

## Project Context

**Project:** Multiplayer Tanks Web Game
**Platform:** Web app (desktop + mobile responsive)
**Features:** Real-time multiplayer, leaderboards, community
**User:** Guy Bertental
**Stack:** React + TypeScript + Vite (client), Node.js + Colyseus (server), Vitest (tests)

## Team Status (as of 2026-03-22)

**Bart (Frontend):** ✅ Phaser 3 canvas complete with tank controls and mobile support  
**Lisa (Backend):** ✅ Colyseus server running at 60Hz with collision detection and matchmaking  
**Milhouse (Tester):** ✅ Vitest framework with 75 tests passing (36 server, 39 client)

## Learnings

### Backend Setup (2026-03-22)
- **Stack chosen:** Node.js + Express + Socket.io + TypeScript
- **Entry point:** `server/src/index.ts` - Express + Socket.io on port 3001
- **Dependencies:** express, socket.io, cors, dotenv, typescript, ts-node
- **Folder structure:**
  - `server/src/routes/` - REST API endpoints
  - `server/src/sockets/` - WebSocket handlers for real-time game
  - `server/src/game/` - Game state, physics, collisions
  - `server/src/db/` - Database layer (TBD which DB)
  - `server/src/types/` - Shared TypeScript interfaces
- **Scripts:** `npm run dev` (ts-node), `npm run build` (tsc)
- **Health check:** GET `/health` returns `{ status: 'ok', timestamp }`

### Colyseus Game Server (2026-03-22)
- **Game framework:** Colyseus 0.17.x - purpose-built multiplayer game framework
- **Dual server architecture:**
  - Express API on port 3001 (REST endpoints, matchmaking)
  - Colyseus WebSocket on port 2567 (game state sync)
- **Key files:**
  - `server/src/game/GameRoom.ts` — Main Colyseus room with game loop (60 tick/sec)
  - `server/src/game/GameState.ts` — Schema for sync: players + bullets MapSchema
  - `server/src/game/Player.ts` — Player schema (x, y, rotation, health, kills, deaths)
  - `server/src/game/Bullet.ts` — Bullet schema (position, velocity, owner)
  - `server/src/types/shared.ts` — Shared constants + input types for client
- **Colyseus patterns:**
  - Use `@type()` decorators on Schema properties for automatic sync
  - Room generic takes `RoomOptions` interface (not state type directly)
  - Use `matchMaker.query()` and `matchMaker.createRoom()` for room management
  - Game loop via `setInterval` in `onCreate()`, cleanup in `onDispose()`
  - `onLeave()` signature uses `code?: number`, not `consented: boolean`
- **Endpoints:**
  - `POST /matchmaking` — Find or create game room, returns `{ roomId, wsUrl }`
  - `GET /rooms` — List active rooms for debugging/lobby
  - `GET /health` — Server health check
- **tsconfig requirements:** `experimentalDecorators: true`, `strictPropertyInitialization: false`
- **Game config:** 60Hz tick rate, 8 players max, 1600x1200 arena, 3s respawn
