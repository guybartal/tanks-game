import { describe, it, expect } from 'vitest';
import { GameState } from '../GameState';
import { Player } from '../Player';
import { Bullet } from '../Bullet';
import { GAME_CONFIG } from '../../types/shared';

/**
 * Tests for Colyseus game schemas and GameRoom
 * The game logic now lives in GameRoom.ts using Colyseus Schema
 */

describe('Colyseus Game Schemas', () => {
  describe('Player', () => {
    it('should create a player with default values', () => {
      const player = new Player();
      expect(player.id).toBe('');
      expect(player.name).toBe('');
      expect(player.x).toBe(0);
      expect(player.y).toBe(0);
      expect(player.health).toBe(100);
      expect(player.isAlive).toBe(true);
      expect(player.kills).toBe(0);
      expect(player.deaths).toBe(0);
    });

    it('should allow setting player properties', () => {
      const player = new Player();
      player.id = 'player1';
      player.name = 'TestPlayer';
      player.x = 100;
      player.y = 200;
      player.rotation = Math.PI;
      player.health = 75;

      expect(player.id).toBe('player1');
      expect(player.name).toBe('TestPlayer');
      expect(player.x).toBe(100);
      expect(player.y).toBe(200);
      expect(player.rotation).toBe(Math.PI);
      expect(player.health).toBe(75);
    });
  });

  describe('Bullet', () => {
    it('should create a bullet with default values', () => {
      const bullet = new Bullet();
      expect(bullet.id).toBe('');
      expect(bullet.ownerId).toBe('');
      expect(bullet.x).toBe(0);
      expect(bullet.y).toBe(0);
      expect(bullet.velocityX).toBe(0);
      expect(bullet.velocityY).toBe(0);
    });

    it('should track velocity for movement', () => {
      const bullet = new Bullet();
      bullet.velocityX = Math.cos(0) * GAME_CONFIG.BULLET_SPEED;
      bullet.velocityY = Math.sin(0) * GAME_CONFIG.BULLET_SPEED;

      expect(bullet.velocityX).toBeCloseTo(GAME_CONFIG.BULLET_SPEED);
      expect(bullet.velocityY).toBeCloseTo(0);
    });
  });

  describe('GameState', () => {
    it('should create a game state with empty collections', () => {
      const state = new GameState();
      expect(state.players.size).toBe(0);
      expect(state.bullets.size).toBe(0);
      expect(state.gameStarted).toBe(false);
      expect(state.tickNumber).toBe(0);
    });

    it('should allow adding players', () => {
      const state = new GameState();
      const player = new Player();
      player.id = 'player1';
      player.name = 'Test';

      state.players.set('player1', player);

      expect(state.players.size).toBe(1);
      expect(state.players.get('player1')?.name).toBe('Test');
    });

    it('should allow adding bullets', () => {
      const state = new GameState();
      const bullet = new Bullet();
      bullet.id = 'bullet1';
      bullet.ownerId = 'player1';

      state.bullets.set('bullet1', bullet);

      expect(state.bullets.size).toBe(1);
      expect(state.bullets.get('bullet1')?.ownerId).toBe('player1');
    });
  });

  describe('GAME_CONFIG', () => {
    it('should have sensible game configuration', () => {
      expect(GAME_CONFIG.TICK_RATE).toBe(60);
      expect(GAME_CONFIG.PLAYER_MAX_HEALTH).toBe(100);
      expect(GAME_CONFIG.BULLET_DAMAGE).toBe(25);
      expect(GAME_CONFIG.MAX_PLAYERS_PER_ROOM).toBe(8);
      expect(GAME_CONFIG.ARENA_WIDTH).toBeGreaterThan(0);
      expect(GAME_CONFIG.ARENA_HEIGHT).toBeGreaterThan(0);
    });

    it('should have a respawn time', () => {
      expect(GAME_CONFIG.RESPAWN_TIME).toBeGreaterThan(0);
    });

    it('should have positive speeds', () => {
      expect(GAME_CONFIG.PLAYER_SPEED).toBeGreaterThan(0);
      expect(GAME_CONFIG.BULLET_SPEED).toBeGreaterThan(0);
      expect(GAME_CONFIG.TANK_ROTATION_SPEED).toBeGreaterThan(0);
    });
  });
});
