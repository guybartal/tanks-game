# Milhouse — History

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

### 2026-03-22: Testing Infrastructure Setup

**Key Paths:**
- `tests/` — Root test directory (planning docs)
- `tests/TEST_PLAN.md` — Detailed test categories and checklist

### 2026-03-22: Vitest Framework Implementation

**Test Framework:** Vitest (chosen for native ESM, TypeScript, and Vite integration)

**Server Tests:**
- Config: `server/vitest.config.ts` — node environment
- Tests: `server/src/game/__tests__/GameState.test.ts` (36 tests)
- Coverage: Player join/leave, bullet creation/collision, scoring, respawn
- Run: `cd server && npm test`

**Client Tests:**
- Config: `client/vitest.config.ts` — jsdom environment, React plugin
- Tests: `client/src/game/__tests__/Tank.test.ts` (39 tests)
- Coverage: Movement calculations, rotation math, firing cooldown
- Run: `cd client && npm test`

**Root-Level Commands:**
- `package.json` at root with `npm test` runs both client and server
- `npm run test:client` / `npm run test:server` for individual runs
- `npm run test:watch:client` / `npm run test:watch:server` for dev

**Testing Patterns Used:**
- `beforeEach` for state reset
- Group by feature: `describe('Player Management')`, `describe('Firing')`
- `toBeCloseTo()` for floating-point comparisons (rotation math)
- Boundary testing: collision radii, out-of-bounds bullets

**Next Steps:**
- Integration tests for WebSocket events
- E2E tests with Playwright
- Performance/load testing with k6

**Multiplayer Edge Cases (Critical):**
- Disconnect scenarios (mid-game, lobby, reconnection grace period)
- Race conditions (simultaneous kills, both-die-same-tick)
- Network conditions (high latency, packet loss, jitter)
- Cheating prevention (position spoofing, rapid-fire, replay attacks)
