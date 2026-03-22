# Bart — History

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

### 2026-03-22: Frontend Scaffold Setup
- **Stack chosen:** React + TypeScript + Vite for fast builds and HMR
- **State management:** Zustand (lightweight, no boilerplate)
- **Realtime:** socket.io-client for multiplayer communication
- **Styling:** TailwindCSS v4 with @tailwindcss/vite plugin
- **Key paths:**
  - `client/` — frontend root
  - `client/src/components/` — UI components
  - `client/src/game/` — game engine and canvas rendering
  - `client/src/hooks/` — custom React hooks
  - `client/src/store/` — zustand stores
  - `client/src/types/` — TypeScript types
- **Build:** `npm run build` produces dist/ with optimized bundles
- **Dev:** `npm run dev` starts Vite dev server on port 5173

### 2026-03-22: Phaser 3 Game Engine Setup
- **Engine:** Phaser 3.80+ with arcade physics
- **Pattern:** Scene-based architecture (BootScene → GameScene)
- **Key files:**
  - `client/src/game/config.ts` — Phaser config (1280x720, auto-scaling)
  - `client/src/game/scenes/BootScene.ts` — Asset loading, procedural texture generation
  - `client/src/game/scenes/GameScene.ts` — Main gameplay, input handling
  - `client/src/game/entities/Tank.ts` — Tank container with body + turret
  - `client/src/game/entities/Bullet.ts` — Projectile sprite with lifespan
  - `client/src/game/index.ts` — Game lifecycle (createGame/destroyGame)
- **Input handling:**
  - Desktop: WASD/arrows for movement, mouse aim, click to fire
  - Mobile: Virtual joystick (left), tap-to-fire (right side)
- **Gotchas:**
  - Phaser Container has `body` property; use `tankBody` for the visual
  - Use `useRef` to prevent double-init in React StrictMode
  - Generate textures programmatically in BootScene (no asset files needed initially)
- **Scale:** Phaser.Scale.FIT with CENTER_BOTH for responsive canvas
