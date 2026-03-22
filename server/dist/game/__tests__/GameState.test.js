"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const GameState_1 = require("../GameState");
const Player_1 = require("../Player");
const Bullet_1 = require("../Bullet");
const shared_1 = require("../../types/shared");
/**
 * Tests for Colyseus game schemas and GameRoom
 * The game logic now lives in GameRoom.ts using Colyseus Schema
 */
(0, vitest_1.describe)('Colyseus Game Schemas', () => {
    (0, vitest_1.describe)('Player', () => {
        (0, vitest_1.it)('should create a player with default values', () => {
            const player = new Player_1.Player();
            (0, vitest_1.expect)(player.id).toBe('');
            (0, vitest_1.expect)(player.name).toBe('');
            (0, vitest_1.expect)(player.x).toBe(0);
            (0, vitest_1.expect)(player.y).toBe(0);
            (0, vitest_1.expect)(player.health).toBe(100);
            (0, vitest_1.expect)(player.isAlive).toBe(true);
            (0, vitest_1.expect)(player.kills).toBe(0);
            (0, vitest_1.expect)(player.deaths).toBe(0);
        });
        (0, vitest_1.it)('should allow setting player properties', () => {
            const player = new Player_1.Player();
            player.id = 'player1';
            player.name = 'TestPlayer';
            player.x = 100;
            player.y = 200;
            player.rotation = Math.PI;
            player.health = 75;
            (0, vitest_1.expect)(player.id).toBe('player1');
            (0, vitest_1.expect)(player.name).toBe('TestPlayer');
            (0, vitest_1.expect)(player.x).toBe(100);
            (0, vitest_1.expect)(player.y).toBe(200);
            (0, vitest_1.expect)(player.rotation).toBe(Math.PI);
            (0, vitest_1.expect)(player.health).toBe(75);
        });
    });
    (0, vitest_1.describe)('Bullet', () => {
        (0, vitest_1.it)('should create a bullet with default values', () => {
            const bullet = new Bullet_1.Bullet();
            (0, vitest_1.expect)(bullet.id).toBe('');
            (0, vitest_1.expect)(bullet.ownerId).toBe('');
            (0, vitest_1.expect)(bullet.x).toBe(0);
            (0, vitest_1.expect)(bullet.y).toBe(0);
            (0, vitest_1.expect)(bullet.velocityX).toBe(0);
            (0, vitest_1.expect)(bullet.velocityY).toBe(0);
        });
        (0, vitest_1.it)('should track velocity for movement', () => {
            const bullet = new Bullet_1.Bullet();
            bullet.velocityX = Math.cos(0) * shared_1.GAME_CONFIG.BULLET_SPEED;
            bullet.velocityY = Math.sin(0) * shared_1.GAME_CONFIG.BULLET_SPEED;
            (0, vitest_1.expect)(bullet.velocityX).toBeCloseTo(shared_1.GAME_CONFIG.BULLET_SPEED);
            (0, vitest_1.expect)(bullet.velocityY).toBeCloseTo(0);
        });
    });
    (0, vitest_1.describe)('GameState', () => {
        (0, vitest_1.it)('should create a game state with empty collections', () => {
            const state = new GameState_1.GameState();
            (0, vitest_1.expect)(state.players.size).toBe(0);
            (0, vitest_1.expect)(state.bullets.size).toBe(0);
            (0, vitest_1.expect)(state.gameStarted).toBe(false);
            (0, vitest_1.expect)(state.tickNumber).toBe(0);
        });
        (0, vitest_1.it)('should allow adding players', () => {
            const state = new GameState_1.GameState();
            const player = new Player_1.Player();
            player.id = 'player1';
            player.name = 'Test';
            state.players.set('player1', player);
            (0, vitest_1.expect)(state.players.size).toBe(1);
            (0, vitest_1.expect)(state.players.get('player1')?.name).toBe('Test');
        });
        (0, vitest_1.it)('should allow adding bullets', () => {
            const state = new GameState_1.GameState();
            const bullet = new Bullet_1.Bullet();
            bullet.id = 'bullet1';
            bullet.ownerId = 'player1';
            state.bullets.set('bullet1', bullet);
            (0, vitest_1.expect)(state.bullets.size).toBe(1);
            (0, vitest_1.expect)(state.bullets.get('bullet1')?.ownerId).toBe('player1');
        });
    });
    (0, vitest_1.describe)('GAME_CONFIG', () => {
        (0, vitest_1.it)('should have sensible game configuration', () => {
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.TICK_RATE).toBe(60);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.PLAYER_MAX_HEALTH).toBe(100);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.BULLET_DAMAGE).toBe(25);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.MAX_PLAYERS_PER_ROOM).toBe(8);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.ARENA_WIDTH).toBeGreaterThan(0);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.ARENA_HEIGHT).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should have a respawn time', () => {
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.RESPAWN_TIME).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('should have positive speeds', () => {
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.PLAYER_SPEED).toBeGreaterThan(0);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.BULLET_SPEED).toBeGreaterThan(0);
            (0, vitest_1.expect)(shared_1.GAME_CONFIG.TANK_ROTATION_SPEED).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=GameState.test.js.map