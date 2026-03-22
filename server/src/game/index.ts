// Colyseus game module exports
// Main game logic lives in GameRoom.ts using Colyseus Schema

export { GameRoom } from './GameRoom';
export { GameState } from './GameState';
export { Player } from './Player';
export { Bullet } from './Bullet';

// Game constants (shared between server and can be used by client)
export const TANK_RADIUS = 20;
export const BULLET_RADIUS = 5;

