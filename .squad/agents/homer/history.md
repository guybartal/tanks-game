# Homer — History

## Project Context

**Project:** Multiplayer Tanks Web Game
**Platform:** Web app (desktop + mobile responsive)
**Features:** Real-time multiplayer, leaderboards, community
**User:** Guy Bertental
**Stack:** TBD

## Learnings

### 2026-03-22: Initial Architecture Design
- **Stack chosen**: React 18 + Vite (frontend), Fastify + Colyseus (backend), PostgreSQL + Redis (data)
- **Key decision**: Colyseus for game server over raw Socket.IO — handles state sync, rooms, and reconnection out of the box
- **Pattern**: Client-side prediction with server reconciliation for responsive feel despite latency
- **Anti-cheat**: Server is authoritative — clients send inputs, never positions
- **Mobile**: Same codebase, Phaser scale manager handles responsive canvas
- **Scaling strategy**: Start monolith on single VPS, split to K8s when >100 concurrent players
- **Key files**: `/ARCHITECTURE.md` (system design), `/apps/web` (frontend), `/apps/server` (backend), `/packages/shared` (types)
