import express from 'express';
import { createServer } from 'http';
import { Server as ColyseusServer, matchMaker } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { GameRoom } from './game/GameRoom';

dotenv.config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000';

// Plain httpServer — Colyseus manages Express via its `express` option
// to avoid CORS header conflicts between Express and Colyseus.
const httpServer = createServer();

// Socket.io for lobby/chat (separate from game)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Colyseus game server — shares the same HTTP server so matchmaking
// and WebSocket connections go through a single port.
const gameServer = new ColyseusServer({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
  express: (app) => {
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          api: 'running',
          gameServer: 'running',
        }
      });
    });

    // Matchmaking endpoint - returns room to join or creates new one
    app.post('/matchmaking', async (_req, res) => {
      try {
        const rooms = await matchMaker.query({ name: 'tanks' });
        const availableRoom = rooms.find((room) =>
          room.clients < 8 && !room.locked
        );

        if (availableRoom) {
          res.json({ roomId: availableRoom.roomId });
        } else {
          const room = await matchMaker.createRoom('tanks', {});
          res.json({ roomId: room.roomId });
        }
      } catch (error) {
        console.error('Matchmaking error:', error);
        res.status(500).json({ error: 'Failed to find or create room' });
      }
    });

    // Get active rooms (for debugging/lobby)
    app.get('/rooms', async (_req, res) => {
      try {
        const rooms = await matchMaker.query({ name: 'tanks' });
        res.json(rooms.map((room) => ({
          roomId: room.roomId,
          clients: room.clients,
          maxClients: room.maxClients,
          locked: room.locked ?? false,
        })));
      } catch (error) {
        res.status(500).json({ error: 'Failed to get rooms' });
      }
    });
  },
});

// Register game room
gameServer.define('tanks', GameRoom);

// Socket.io for lobby chat (separate from game rooms)
io.on('connection', (socket) => {
  console.log(`Lobby connection: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Lobby disconnected: ${socket.id}`);
  });
});

// Colyseus calls listen on the shared httpServer and registers
// its matchmaking routes (e.g. /matchmake/joinOrCreate/).
gameServer.listen(Number(PORT)).then(() => {
  console.log(`API + Colyseus game server running on port ${PORT}`);
});

export { io, httpServer, gameServer };
