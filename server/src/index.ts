import express from 'express';
import { createServer } from 'http';
import { Server as ColyseusServer, matchMaker } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { GameRoom } from './game/GameRoom';

dotenv.config();

const PORT = process.env.PORT || 3001;
const GAME_WS_PORT = parseInt(process.env.GAME_WS_PORT || '2567', 10);

const app = express();
const httpServer = createServer(app);

// Socket.io for lobby/chat (separate from game)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Colyseus game server
const gameServer = new ColyseusServer({
  transport: new WebSocketTransport({
    server: createServer(), // Separate HTTP server for Colyseus
  }),
});

// Register game room
gameServer.define('tanks', GameRoom);

// Middleware
app.use(cors());
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
    // Try to find an available room
    const rooms = await matchMaker.query({ name: 'tanks' });
    
    // Find a room with space
    const availableRoom = rooms.find((room) => 
      room.clients < 8 && !room.locked
    );
    
    if (availableRoom) {
      res.json({
        roomId: availableRoom.roomId,
        wsUrl: `ws://localhost:${GAME_WS_PORT}`,
      });
    } else {
      // Create a new room
      const room = await matchMaker.createRoom('tanks', {});
      res.json({
        roomId: room.roomId,
        wsUrl: `ws://localhost:${GAME_WS_PORT}`,
      });
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

// Socket.io for lobby chat (separate from game rooms)
io.on('connection', (socket) => {
  console.log(`Lobby connection: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Lobby disconnected: ${socket.id}`);
  });
});

// Start servers
httpServer.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

gameServer.listen(GAME_WS_PORT).then(() => {
  console.log(`Colyseus game server running on ws://localhost:${GAME_WS_PORT}`);
});

export { app, io, httpServer, gameServer };
