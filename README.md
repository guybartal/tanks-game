# 🎮 Tanks Game

A real-time multiplayer tank battle game built with modern web technologies. Battle against other players in fast-paced 2D combat with smooth client-side prediction and server-authoritative gameplay.

## Features

- **Real-time Multiplayer** — Fight against other players with low-latency networking
- **Smooth Gameplay** — Client-side prediction with server reconciliation for responsive controls
- **Cross-platform** — Play on desktop, tablet, or mobile browsers
- **Matchmaking** — MMR-based matchmaking for balanced games
- **Leaderboards** — Track your stats and compete for top rankings

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Phaser 3, Zustand, Tailwind CSS |
| Backend | Node.js, Express, Colyseus, Socket.IO |
| Database | PostgreSQL, Redis |
| Language | TypeScript |

## Prerequisites

- **Node.js** 20 LTS or higher
- **npm** (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/guybartal/tanks-game.git
cd tanks-game
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure environment

```bash
# In the server directory, copy the example env file
cp .env.example .env

# Edit .env with your configuration (database, etc.)
```

### 4. Start the development servers

**Terminal 1 — Start the server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Start the client:**
```bash
cd client
npm run dev
```

### 5. Open the game

Navigate to `http://localhost:5173` in your browser.

## Project Structure

```
tanks/
├── client/          # React + Phaser frontend
│   ├── src/
│   │   ├── components/  # React UI components
│   │   ├── game/        # Phaser scenes & game logic
│   │   ├── store/       # Zustand state management
│   │   └── hooks/       # Custom React hooks
│   └── package.json
│
├── server/          # Node.js backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── game/        # Colyseus game rooms
│   │   ├── sockets/     # Socket.IO handlers
│   │   └── db/          # Database schema
│   └── package.json
│
├── tests/           # Integration tests
└── package.json     # Monorepo root
```

## Available Scripts

### Root

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (client + server) |
| `npm run test:client` | Run client tests only |
| `npm run test:server` | Run server tests only |

### Client (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

### Server (`cd server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run tests |

## How to Play

1. **Move** — Use WASD or arrow keys to drive your tank
2. **Aim** — Move the mouse to aim your turret
3. **Fire** — Click or press Space to shoot
4. **Objective** — Destroy enemy tanks and survive!

## Running in Kubernetes (Kind)

Requires: Docker, Kind, kubectl.

```bash
# Build images
docker build -t tanks-server:local ./server
docker build -t tanks-client:local --build-arg VITE_SERVER_URL=ws://localhost:30300 ./client

# Load into Kind cluster
kind load docker-image tanks-server:local tanks-client:local --name <cluster-name>

# Deploy
kubectl apply -f k8s/tanks.yaml

# Port-forward
kubectl port-forward -n tanks svc/tanks-server 30300:3000 &
kubectl port-forward -n tanks svc/tanks-client 30080:80 &
```

Open http://localhost:30080.

## Architecture

For detailed technical architecture including system components, data flow, and deployment considerations, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

ISC
