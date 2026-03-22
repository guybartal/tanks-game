# Squad Decisions

## Active Decisions

### 2026-03-22T09:32:55Z: Team Formation
**By:** Squad (Coordinator)
**What:** Hired initial team from The Simpsons universe: Homer (Lead), Bart (Frontend), Lisa (Backend), Milhouse (Tester), plus Scribe and Ralph.
**Why:** User requested Simpsons casting for multiplayer tanks game project.

### 2026-03-22T09:32:55Z: Project Scope
**By:** Squad (Coordinator)
**What:** Building a multiplayer tanks game as a web app with leaderboards and community features. Must work on desktop and mobile.
**Why:** Initial project definition from user.

### 2026-03-22: Initial Tech Stack
**By:** Homer (Lead)  
**Status:** Approved
**What:** 
- **Frontend:** React 18 + Vite + Phaser 3 + Zustand + Tailwind CSS
- **Backend:** Node.js 20 + Express 5.x + Socket.io 4.x
- **Database:** PostgreSQL 16 + Redis 7
- **Infrastructure:** Monorepo, Docker, GitHub Actions
**Why:** 
- Colyseus replaced with Phaser 3 for 2D rendering + Socket.io for real-time comms
- PostgreSQL for leaderboards with efficient ranking queries
- Redis for session caching and pub/sub scaling
- Single codebase serves desktop/mobile via responsive React UI
**Impact:** Team learns Phaser 3 game loop; TypeScript strict mode everywhere; MVP on $20/mo VPS

### 2026-03-22: Frontend Stack Implementation
**By:** Bart (Frontend Dev)  
**Status:** Implemented
**What:** 
- React + TypeScript via Vite
- Zustand for state management (game state, player info, UI state)
- socket.io-client for real-time multiplayer communication
- TailwindCSS for responsive styling
**Why:**
- Vite: Fastest DX with instant HMR and native ESM
- Zustand: Minimal boilerplate for frequent game state updates
- socket.io-client: Industry standard with graceful reconnection
- TailwindCSS: Mobile-first utility classes for desktop/mobile
**Folder Structure:** client/src/{components, game, hooks, store, types}
**Impact:** Lisa must plan WebSocket endpoints compatible with socket.io events

### 2026-03-22: Backend Stack Implementation
**By:** Lisa (Backend Dev)  
**Status:** Implemented
**What:**
- Runtime: Node.js with TypeScript (strict mode)
- HTTP Framework: Express 5.x
- Real-time: Socket.io 4.x for WebSocket communication
- Port: 3001 (configurable via `.env`)
- Client URL: http://localhost:3000 for CORS
**Why:**
- Express: Mature, well-documented REST API framework
- Socket.io: Handles WebSocket complexity (reconnection, fallbacks, rooms)
- TypeScript: Catches bugs early; better IDE support
- Separate ports keep concerns clean
**Endpoints:** Health check at `GET /health`
**Folder Structure:** server/src/{index.ts, routes, sockets, game, db, types}
**Impact:** Bart connects to port 3001; all health monitoring via /health

### 2026-03-22: Testing Infrastructure
**By:** Milhouse (Tester)  
**Status:** Proposed
**What:**
- Four test tiers: unit, integration, E2E, performance
- tests/unit/ — Game logic, state management
- tests/integration/ — API endpoints, WebSocket flows
- tests/e2e/ — Full player journeys, cross-device
- tests/performance/ — Latency, concurrent load
**Why:**
- Unit tests: Catch logic bugs early (fast feedback)
- Integration tests: Verify API contracts and real-time events
- E2E tests: Ensure complete flows work across devices
- Performance tests: Critical for real-time gameplay quality
**Test Priority:**
- P0: Unit + Integration (every commit/PR)
- P1: E2E critical paths + Security (every PR)
- P2: Performance load tests (weekly)
**Open Questions:**
- E2E framework: Playwright or Cypress?
- Client test framework: Vitest or Jest?
- Performance baseline targets?
**Needs Input:** Framework selections from Homer (CI/CD) and Lisa/Bart (client/server preferences)

### 2026-03-22: Phaser 3 Game Engine Architecture
**By:** Bart (Frontend Dev)  
**Date:** 2026-03-22  
**Status:** Implemented
**What:**
- Implemented Phaser 3 game engine with scene pattern (BootScene → GameScene)
- Entity pattern: Tank and Bullet as classes extending Phaser objects
- Dual input system: Keyboard + mouse (desktop), virtual joystick + tap (mobile)
- Canvas: 1280x720 with Phaser.Scale.FIT for responsive scaling
- Physics: Arcade physics with acceleration/deceleration
**Why:**
- Scene pattern organizes code and enables state transitions
- Procedural textures avoid asset loading complexity for MVP
- Dual input ensures mobile-first without breaking desktop
- Container-based Tank allows independent body/turret rotation
**Key Details:**
- Tank uses Phaser Container with child Images for body and turret
- React integration via useRef prevents double-init in StrictMode
- Mobile detection via touch events, maxTouchPoints, viewport width
**Impact:** Lisa syncs tank positions via Colyseus events; future multiplayer state management

### 2026-03-22: Colyseus Game Server Architecture
**Date:** 2026-03-22  
**By:** Lisa (Backend Dev)  
**Status:** Implemented
**What:**
- Added Colyseus 0.17.x as authoritative game server
- Dual server: Express (port 3001, REST + matchmaking) + Colyseus (port 2567, WebSocket)
- 60Hz tick rate for deterministic gameplay
- Schema-based state serialization with delta sync
- Room lifecycle management with built-in matchmaking
**Why:**
- Colyseus handles WebSocket complexity (reconnection, fallbacks, rooms)
- Schema-based sync: only changed properties sent (binary serialization)
- 60 ticks/second ensures smooth client prediction and reconciliation
- Purpose-built for games vs. generic Socket.io
**Key Patterns:**
- GameRoom extends Room<{ state?: GameState }>
- Schema properties use @type() decorators for sync
- Matchmaking via matchMaker.query() and matchMaker.createRoom()
- Game loop via setInterval in onCreate(), cleanup in onDispose()
**Files:**
- server/src/index.ts — Dual server setup
- server/src/game/GameRoom.ts — Main room with 60Hz loop
- server/src/game/{GameState,Player,Bullet}.ts — Colyseus schemas
- server/src/types/shared.ts — Shared client/server constants
**Impact:** Bart connects to ws://localhost:2567 with Colyseus client; client installs colyseus.js

### 2026-03-22: Vitest as Test Framework
**Date:** 2026-03-22
**By:** Milhouse (Tester)
**Status:** Implemented
**What:**
- Vitest for both client and server tests
- Server: vitest with node environment (36 tests, GameState/Player/Bullet)
- Client: vitest with jsdom environment + @testing-library/react (39 tests, Tank/input/firing)
- Unified root package.json with npm test runner
**Why:**
- Native Vite integration — Client already uses Vite; zero config for transforms
- Native ESM — Works with project's ES module setup
- TypeScript first — No babel config needed
- Fast — Vite's transform pipeline makes tests run quickly
- Jest-compatible API — Familiar describe/it/expect syntax
**Configuration:**
- server/vitest.config.ts — node environment
- client/vitest.config.ts — jsdom + React plugin
- Root package.json — npm test runs both suites
**Patterns:**
- Tests co-located: src/**/__tests__/*.test.ts
- beforeEach for state reset
- toBeCloseTo() for floating-point comparisons (rotation math)
- Boundary testing for collision radii and out-of-bounds scenarios
**Impact:** CI/CD runs tests on every PR; 75 tests provide baseline coverage

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
