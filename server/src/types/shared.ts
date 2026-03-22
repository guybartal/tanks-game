/**
 * Shared types for client-server communication
 * These types are used by both Colyseus state and client code
 */

// Input sent from client to server
export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  turretRotation: number; // Angle in radians for turret aim
  sequence: number; // For client-side prediction reconciliation
}

// Server tick rate configuration
export const GAME_CONFIG = {
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
} as const;

// Message types for Colyseus communication
export const MESSAGE_TYPES = {
  INPUT: 'input',
  CHAT: 'chat',
  GAME_OVER: 'gameOver',
  PLAYER_KILLED: 'playerKilled',
  PLAYER_RESPAWNED: 'playerRespawned',
} as const;

// Match result for end of game
export interface MatchResult {
  winnerId: string;
  winnerName: string;
  scores: Array<{
    playerId: string;
    playerName: string;
    kills: number;
    deaths: number;
  }>;
  duration: number;
}
