"use strict";
/**
 * Shared types for client-server communication
 * These types are used by both Colyseus state and client code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_TYPES = exports.GAME_CONFIG = void 0;
// Server tick rate configuration
exports.GAME_CONFIG = {
    TICK_RATE: 60, // Server updates per second
    PLAYER_SPEED: 150, // Units per second
    TANK_ROTATION_SPEED: 3, // Radians per second
    BULLET_SPEED: 400, // Units per second
    BULLET_LIFETIME: 3000, // Milliseconds
    PLAYER_MAX_HEALTH: 100,
    BULLET_DAMAGE: 25,
    RESPAWN_TIME: 3000, // Milliseconds
    MAX_PLAYERS_PER_ROOM: 8,
    ARENA_WIDTH: 1600,
    ARENA_HEIGHT: 1200,
};
// Message types for Colyseus communication
exports.MESSAGE_TYPES = {
    INPUT: 'input',
    CHAT: 'chat',
    GAME_OVER: 'gameOver',
    PLAYER_KILLED: 'playerKilled',
    PLAYER_RESPAWNED: 'playerRespawned',
};
//# sourceMappingURL=shared.js.map