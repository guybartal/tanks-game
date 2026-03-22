"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameServer = exports.httpServer = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const core_1 = require("@colyseus/core");
const ws_transport_1 = require("@colyseus/ws-transport");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const GameRoom_1 = require("./game/GameRoom");
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
const GAME_WS_PORT = parseInt(process.env.GAME_WS_PORT || '2567', 10);
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Socket.io for lobby/chat (separate from game)
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
// Colyseus game server
const gameServer = new core_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: (0, http_1.createServer)(), // Separate HTTP server for Colyseus
    }),
});
exports.gameServer = gameServer;
// Register game room
gameServer.define('tanks', GameRoom_1.GameRoom);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        const rooms = await core_1.matchMaker.query({ name: 'tanks' });
        // Find a room with space
        const availableRoom = rooms.find((room) => room.clients < 8 && !room.locked);
        if (availableRoom) {
            res.json({
                roomId: availableRoom.roomId,
                wsUrl: `ws://localhost:${GAME_WS_PORT}`,
            });
        }
        else {
            // Create a new room
            const room = await core_1.matchMaker.createRoom('tanks', {});
            res.json({
                roomId: room.roomId,
                wsUrl: `ws://localhost:${GAME_WS_PORT}`,
            });
        }
    }
    catch (error) {
        console.error('Matchmaking error:', error);
        res.status(500).json({ error: 'Failed to find or create room' });
    }
});
// Get active rooms (for debugging/lobby)
app.get('/rooms', async (_req, res) => {
    try {
        const rooms = await core_1.matchMaker.query({ name: 'tanks' });
        res.json(rooms.map((room) => ({
            roomId: room.roomId,
            clients: room.clients,
            maxClients: room.maxClients,
            locked: room.locked ?? false,
        })));
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map