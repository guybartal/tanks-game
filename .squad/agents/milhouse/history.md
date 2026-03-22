# Milhouse — History

## Project Context

**Project:** Multiplayer Tanks Web Game
**Platform:** Web app (desktop + mobile responsive)
**Features:** Real-time multiplayer, leaderboards, community
**User:** Guy Bertental
**Stack:** TBD

## Learnings

### 2026-03-22: Testing Infrastructure Setup

**Key Paths:**
- `tests/` — Root test directory
- `tests/README.md` — Testing strategy overview
- `tests/TEST_PLAN.md` — Detailed test categories and checklist
- `tests/unit/` — Unit tests for game logic, state management
- `tests/integration/` — API and WebSocket flow tests
- `tests/e2e/` — Full game flow browser automation
- `tests/performance/` — Load testing and latency benchmarks

**Test Categories Identified:**
1. **Unit:** Tank physics, projectile math, damage calc, state management
2. **Integration:** REST API (auth, leaderboard), WebSocket events (real-time sync)
3. **E2E:** Player journeys, cross-device (desktop + mobile browsers)
4. **Performance:** Latency (<100ms target), concurrent players (10-100 games)

**Multiplayer Edge Cases (Critical):**
- Disconnect scenarios (mid-game, lobby, reconnection grace period)
- Race conditions (simultaneous kills, both-die-same-tick)
- Network conditions (high latency, packet loss, jitter)
- Cheating prevention (position spoofing, rapid-fire, replay attacks)

**Waiting On:**
- Bart & Lisa to finish client/server scaffolding before adding test framework configs
