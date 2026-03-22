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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
