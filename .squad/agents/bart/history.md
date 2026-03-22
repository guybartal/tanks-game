# Bart — History

## Project Context

**Project:** Multiplayer Tanks Web Game
**Platform:** Web app (desktop + mobile responsive)
**Features:** Real-time multiplayer, leaderboards, community
**User:** Guy Bertental
**Stack:** TBD (React likely for frontend)

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
