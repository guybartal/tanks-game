# Tanks Game — System Architecture

**Author:** Homer (Lead)  
**Date:** 2026-03-22  
**Status:** Initial Design

---

## 1. Tech Stack

### Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **React 18 with Vite** | Fast dev experience, excellent ecosystem |
| Game Engine | **Phaser 3.80+** | Battle-tested 2D game engine, good mobile support |
| State Management | **Zustand** | Lightweight, works well with game loops |
| Styling | **Tailwind CSS 3** | Rapid UI development, responsive by default |
| Real-time Client | **Socket.IO Client 4.x** | Automatic reconnection, fallback transports |

### Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js 20 LTS** | Same language as frontend, non-blocking I/O |
| Framework | **Fastify 4** | Faster than Express, better TypeScript support |
| Real-time Server | **Socket.IO 4.x** | Rooms, namespaces, auto-scaling support |
| Game Server | **Colyseus 0.15** | Purpose-built for multiplayer games, handles state sync |
| Auth | **Lucia Auth** | Modern, flexible, works with any database |

### Database
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Primary DB | **PostgreSQL 16** | Reliable, handles leaderboards & rankings well |
| ORM | **Drizzle ORM** | Type-safe, lightweight, excellent DX |
| Cache/Sessions | **Redis 7** | Game state caching, session store, pub/sub |
| Real-time State | **In-memory (Colyseus)** | Authoritative game state lives on game server |

### DevOps
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Monorepo | **Turborepo** | Shared types between client/server |
| Language | **TypeScript 5** | End-to-end type safety |
| Containerization | **Docker** | Consistent environments |
| CI/CD | **GitHub Actions** | Already using GitHub |

---

## 2. System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │  Desktop Web    │  │   Mobile Web    │  │   Tablet Web    │          │
│  │  (React+Phaser) │  │  (React+Phaser) │  │  (React+Phaser) │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            └──────────────┬──────┴─────────────────────┘
                           │ HTTPS / WSS
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER                                    │
│                    (Nginx / Cloudflare)                                  │
│              - SSL termination                                           │
│              - WebSocket sticky sessions                                 │
│              - Static asset CDN                                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌───────────────────┐ ┌─────────────────┐ ┌───────────────────┐
│    API SERVER     │ │   GAME SERVER   │ │   CHAT SERVER     │
│    (Fastify)      │ │   (Colyseus)    │ │   (Socket.IO)     │
│                   │ │                 │ │                   │
│ - REST endpoints  │ │ - Game rooms    │ │ - Lobby chat      │
│ - Auth (Lucia)    │ │ - Physics/Logic │ │ - Team chat       │
│ - Leaderboards    │ │ - State sync    │ │ - Whispers        │
│ - User profiles   │ │ - Matchmaking   │ │ - Moderation      │
└─────────┬─────────┘ └────────┬────────┘ └─────────┬─────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────┐ ┌─────────────────┐ ┌───────────────────┐
│   PostgreSQL      │ │     Redis       │ │   File Storage    │
│                   │ │                 │ │   (S3/R2)         │
│ - Users           │ │ - Sessions      │ │                   │
│ - Match history   │ │ - Game state    │ │ - Profile pics    │
│ - Leaderboards    │ │ - Pub/sub       │ │ - Map assets      │
│ - Chat logs       │ │ - Rate limiting │ │ - Replays (later) │
└───────────────────┘ └─────────────────┘ └───────────────────┘
```

---

## 3. Data Flow — Real-time Multiplayer

### Game Loop (60 tick/second on server, interpolated on client)

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Phaser + React)                       │
├──────────────────────────────────────────────────────────────────┤
│  1. Input Collection (keyboard/touch/gamepad)                    │
│  2. Send input to server (not position — inputs only!)           │
│  3. Client-side prediction (move locally for responsiveness)     │
│  4. Receive authoritative state from server                      │
│  5. Reconcile: correct prediction errors smoothly                │
│  6. Interpolate other players (buffer 2-3 snapshots)             │
│  7. Render at 60fps                                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │ WebSocket (binary MessagePack)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER (Colyseus Room)                        │
├──────────────────────────────────────────────────────────────────┤
│  1. Receive inputs from all clients                              │
│  2. Validate inputs (anti-cheat: speed, fire rate)               │
│  3. Apply physics simulation (deterministic)                     │
│  4. Detect collisions (tanks, bullets, walls)                    │
│  5. Update game state (health, scores, positions)                │
│  6. Broadcast state delta to all clients (16ms tick)             │
│  7. Persist match events to Redis (for replay/analytics)         │
└──────────────────────────────────────────────────────────────────┘
```

### Matchmaking Flow

```
Player clicks "Play" 
    │
    ▼
┌─────────────────────────────────────┐
│  1. Client → API: GET /matchmaking  │
│  2. API checks player MMR           │
│  3. API → Redis: Add to queue       │
│  4. Matchmaker finds 2-8 players    │
│  5. Creates Colyseus room           │
│  6. Returns room ID to players      │
│  7. Players connect to game server  │
└─────────────────────────────────────┘
```

---

## 4. Database Schema Outline

```sql
-- Core user data
users
├── id: uuid (pk)
├── username: varchar(20) unique
├── email: varchar(255) unique
├── password_hash: text
├── display_name: varchar(50)
├── avatar_url: text
├── created_at: timestamp
└── last_seen_at: timestamp

-- User statistics for leaderboards
user_stats
├── user_id: uuid (pk, fk → users)
├── games_played: int default 0
├── games_won: int default 0
├── kills: int default 0
├── deaths: int default 0
├── mmr: int default 1000
├── rank_tier: varchar(20)  -- bronze, silver, gold, etc.
└── updated_at: timestamp

-- Match history
matches
├── id: uuid (pk)
├── mode: varchar(20)  -- deathmatch, team, capture
├── map_id: varchar(50)
├── started_at: timestamp
├── ended_at: timestamp
├── duration_seconds: int
└── replay_url: text nullable

-- Per-player match results
match_players
├── match_id: uuid (fk → matches)
├── user_id: uuid (fk → users)
├── team: int nullable
├── kills: int
├── deaths: int
├── damage_dealt: int
├── placement: int
├── mmr_change: int
└── PRIMARY KEY (match_id, user_id)

-- Friend relationships
friendships
├── user_id: uuid (fk → users)
├── friend_id: uuid (fk → users)
├── status: varchar(20)  -- pending, accepted, blocked
├── created_at: timestamp
└── PRIMARY KEY (user_id, friend_id)

-- Chat messages (recent only, old ones archived)
chat_messages
├── id: uuid (pk)
├── channel: varchar(50)  -- lobby, team:xyz, dm:user1:user2
├── sender_id: uuid (fk → users)
├── content: text
├── created_at: timestamp
└── INDEX on (channel, created_at)
```

---

## 5. API Structure Overview

### REST Endpoints (Fastify)

```
/api/v1
├── /auth
│   ├── POST   /register        # Create account
│   ├── POST   /login           # Get session
│   ├── POST   /logout          # Clear session
│   └── GET    /me              # Current user
│
├── /users
│   ├── GET    /:id             # Public profile
│   ├── PATCH  /me              # Update own profile
│   └── GET    /:id/stats       # Player statistics
│
├── /leaderboards
│   ├── GET    /global          # Top 100 players
│   ├── GET    /weekly          # This week's top
│   └── GET    /friends         # Friends ranking
│
├── /matches
│   ├── GET    /history         # Own match history
│   └── GET    /:id             # Match details
│
├── /matchmaking
│   ├── POST   /join            # Enter queue
│   └── DELETE /leave           # Leave queue
│
└── /friends
    ├── GET    /                # Friend list
    ├── POST   /request         # Send request
    └── POST   /respond         # Accept/reject
```

### WebSocket Events (Colyseus)

```
Game Room Events:
├── onJoin          # Player joins room
├── onLeave         # Player disconnects
├── input           # Player input (movement, fire)
├── state           # Full state sync (on join)
├── patch           # Delta state update (each tick)
├── chat            # In-game quick chat
└── gameOver        # Match ended

Lobby Events (Socket.IO):
├── chat:message    # Chat message
├── chat:typing     # Typing indicator
├── presence:update # Online status
└── friend:online   # Friend came online
```

---

## 6. Deployment Considerations

### MVP (Single Server)
```
┌─────────────────────────────────────┐
│        Single VPS (4GB RAM)         │
│  ┌────────────────────────────────┐ │
│  │ Docker Compose                 │ │
│  │  - nginx (reverse proxy)       │ │
│  │  - app (API + Game + Chat)     │ │
│  │  - postgres                    │ │
│  │  - redis                       │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
Provider: Hetzner, DigitalOcean, or Railway
Cost: ~$20-40/month
Capacity: ~100 concurrent players
```

### Production (Scaled)
```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare                           │
│           (CDN, DDoS protection, SSL)                   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                   Kubernetes Cluster                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ API Pods    │  │ Game Pods   │  │ Chat Pods   │      │
│  │ (2-4)       │  │ (2-8)       │  │ (2)         │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Managed Postgres│ │   Redis Cluster │ │  R2/S3 Storage  │
│ (Neon/Supabase) │ │   (Upstash)     │ │  (Cloudflare)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Key Deployment Notes

1. **WebSocket Sticky Sessions**: Game connections MUST route to the same server. Use IP hash or connection ID routing.

2. **Game Server Scaling**: Each Colyseus instance handles ~50 rooms. Scale horizontally with presence service (Redis).

3. **Static Assets**: Serve via CDN. Phaser game assets can be 5-20MB — caching is critical.

4. **Mobile Considerations**:
   - Touch controls built into Phaser input system
   - Responsive canvas sizing (Phaser scale manager)
   - Reduced particle effects on mobile (detect via `navigator.maxTouchPoints`)
   - Battery: lower tick rate when game unfocused

5. **Monitoring**:
   - Sentry for error tracking
   - Prometheus + Grafana for metrics
   - Game-specific: track latency percentiles, prediction errors

---

## 7. Project Structure

```
tanks/
├── apps/
│   ├── web/                 # React + Phaser frontend
│   │   ├── src/
│   │   │   ├── components/  # React UI components
│   │   │   ├── game/        # Phaser scenes & logic
│   │   │   ├── stores/      # Zustand state
│   │   │   └── lib/         # Utilities
│   │   └── vite.config.ts
│   │
│   └── server/              # Backend monolith (split later)
│       ├── src/
│       │   ├── api/         # Fastify routes
│       │   ├── game/        # Colyseus rooms
│       │   ├── chat/        # Socket.IO handlers
│       │   ├── db/          # Drizzle schema + queries
│       │   └── lib/         # Shared utilities
│       └── package.json
│
├── packages/
│   └── shared/              # Shared types & constants
│       ├── types.ts         # Game state types
│       └── constants.ts     # Physics values, limits
│
├── docker-compose.yml
├── turbo.json
└── ARCHITECTURE.md          # This file
```

---

## Next Steps

1. **Bart (Frontend)**: Set up React + Vite + Phaser, create basic game canvas
2. **Lisa (Backend)**: Set up Fastify + Colyseus, implement basic room
3. **Both**: Agree on shared types in `packages/shared`
4. **Homer**: Review after initial scaffolding complete

---

*Architecture is a living document. Update as we learn.*
