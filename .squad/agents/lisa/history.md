# Lisa — History

## Project Context

**Project:** Multiplayer Tanks Web Game
**Platform:** Web app (desktop + mobile responsive)
**Features:** Real-time multiplayer, leaderboards, community
**User:** Guy Bertental
**Stack:** TBD (Node.js likely for backend)

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
