import { Room, Client, RoomOptions } from '@colyseus/core';
import { GameState } from './GameState';
import { Player } from './Player';
import { Bullet } from './Bullet';
import { 
  PlayerInput, 
  GAME_CONFIG, 
  MESSAGE_TYPES 
} from '../types/shared';

interface TanksRoomOptions extends RoomOptions {
  state?: GameState;
}

export class GameRoom extends Room<TanksRoomOptions> {
  private bulletIdCounter = 0;
  private tickInterval: NodeJS.Timeout | null = null;

  onCreate(_options: Record<string, unknown>) {
    console.log('GameRoom created:', this.roomId);
    
    this.setState(new GameState());
    this.maxClients = GAME_CONFIG.MAX_PLAYERS_PER_ROOM;

    // Handle player input
    this.onMessage(MESSAGE_TYPES.INPUT, (client: Client, input: PlayerInput) => {
      this.handleInput(client, input);
    });

    // Start the game loop
    this.startGameLoop();
  }

  onJoin(client: Client, options: { name?: string }) {
    console.log(`Player joined: ${client.sessionId}`);

    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || `Player_${client.sessionId.slice(0, 4)}`;
    
    // Spawn at random position
    const spawn = this.getSpawnPosition();
    player.x = spawn.x;
    player.y = spawn.y;
    player.rotation = Math.random() * Math.PI * 2;
    player.turretRotation = player.rotation;
    player.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    player.isAlive = true;

    this.state.players.set(client.sessionId, player);

    // Start game when we have at least 1 player (for testing)
    if (!this.state.gameStarted && this.state.players.size >= 1) {
      this.state.gameStarted = true;
      this.state.startTime = Date.now();
    }
  }

  onLeave(client: Client, _code?: number) {
    console.log(`Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('GameRoom disposed:', this.roomId);
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }

  private startGameLoop() {
    const tickMs = 1000 / GAME_CONFIG.TICK_RATE;
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, tickMs);
  }

  private tick() {
    if (!this.state.gameStarted) return;

    const deltaTime = 1 / GAME_CONFIG.TICK_RATE;
    this.state.tickNumber++;

    // Update bullets
    this.updateBullets(deltaTime);

    // Check respawns
    this.checkRespawns();

    // Check collisions
    this.checkCollisions();
  }

  private handleInput(client: Client, input: PlayerInput) {
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.isAlive) return;

    const deltaTime = 1 / GAME_CONFIG.TICK_RATE;

    // XY-axis movement (WASD maps to screen directions)
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.forward) dy -= 1;
    if (input.backward) dy += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
      player.x += dx * GAME_CONFIG.PLAYER_SPEED * deltaTime;
      player.y += dy * GAME_CONFIG.PLAYER_SPEED * deltaTime;
      // Rotate body toward movement direction
      player.rotation = Math.atan2(dy, dx);
    }

    // Clamp to arena bounds
    player.x = Math.max(20, Math.min(GAME_CONFIG.ARENA_WIDTH - 20, player.x));
    player.y = Math.max(20, Math.min(GAME_CONFIG.ARENA_HEIGHT - 20, player.y));

    // Update turret rotation
    player.turretRotation = input.turretRotation;

    // Handle firing
    if (input.fire) {
      this.fireBullet(player);
    }

    // Update sequence for client reconciliation
    player.lastInputSeq = input.sequence;
  }

  private fireBullet(player: Player) {
    const now = Date.now();
    const fireRate = 200; // Minimum ms between shots

    if (now - player.lastFireTime < fireRate) return;
    player.lastFireTime = now;

    const bullet = new Bullet();
    bullet.id = `${player.id}_${this.bulletIdCounter++}`;
    bullet.ownerId = player.id;
    
    // Spawn bullet at tank's turret position
    const turretLength = 30;
    bullet.x = player.x + Math.cos(player.turretRotation) * turretLength;
    bullet.y = player.y + Math.sin(player.turretRotation) * turretLength;
    
    bullet.velocityX = Math.cos(player.turretRotation) * GAME_CONFIG.BULLET_SPEED;
    bullet.velocityY = Math.sin(player.turretRotation) * GAME_CONFIG.BULLET_SPEED;
    bullet.createdAt = now;

    this.state.bullets.set(bullet.id, bullet);
  }

  private updateBullets(deltaTime: number) {
    const now = Date.now();
    const bulletsToRemove: string[] = [];

    this.state.bullets.forEach((bullet: Bullet, id: string) => {
      // Update position
      bullet.x += bullet.velocityX * deltaTime;
      bullet.y += bullet.velocityY * deltaTime;

      // Check if out of bounds or expired
      if (
        bullet.x < 0 || bullet.x > GAME_CONFIG.ARENA_WIDTH ||
        bullet.y < 0 || bullet.y > GAME_CONFIG.ARENA_HEIGHT ||
        now - bullet.createdAt > GAME_CONFIG.BULLET_LIFETIME
      ) {
        bulletsToRemove.push(id);
      }
    });

    bulletsToRemove.forEach(id => this.state.bullets.delete(id));
  }

  private checkCollisions() {
    const bulletsToRemove: string[] = [];
    const tankRadius = 20;
    const bulletRadius = 5;

    this.state.bullets.forEach((bullet: Bullet, bulletId: string) => {
      this.state.players.forEach((player: Player) => {
        if (!player.isAlive) return;
        if (player.id === bullet.ownerId) return; // No self-damage

        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < tankRadius + bulletRadius) {
          bulletsToRemove.push(bulletId);
          this.damagePlayer(player, bullet.ownerId);
        }
      });
    });

    bulletsToRemove.forEach(id => this.state.bullets.delete(id));
  }

  private damagePlayer(player: Player, attackerId: string) {
    player.health -= GAME_CONFIG.BULLET_DAMAGE;

    if (player.health <= 0) {
      player.health = 0;
      player.isAlive = false;
      player.deaths++;
      player.respawnTime = Date.now() + GAME_CONFIG.RESPAWN_TIME;

      // Credit kill to attacker
      const attacker = this.state.players.get(attackerId);
      if (attacker) {
        attacker.kills++;
      }

      this.broadcast(MESSAGE_TYPES.PLAYER_KILLED, {
        killedId: player.id,
        killedName: player.name,
        killerId: attackerId,
        killerName: attacker?.name || 'Unknown',
      });
    }
  }

  private checkRespawns() {
    const now = Date.now();

    this.state.players.forEach((player: Player) => {
      if (!player.isAlive && player.respawnTime > 0 && now >= player.respawnTime) {
        this.respawnPlayer(player);
      }
    });
  }

  private respawnPlayer(player: Player) {
    const spawn = this.getSpawnPosition();
    player.x = spawn.x;
    player.y = spawn.y;
    player.rotation = Math.random() * Math.PI * 2;
    player.turretRotation = player.rotation;
    player.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
    player.isAlive = true;
    player.respawnTime = 0;

    this.broadcast(MESSAGE_TYPES.PLAYER_RESPAWNED, {
      playerId: player.id,
      playerName: player.name,
    });
  }

  private getSpawnPosition(): { x: number; y: number } {
    const padding = 100;
    return {
      x: padding + Math.random() * (GAME_CONFIG.ARENA_WIDTH - padding * 2),
      y: padding + Math.random() * (GAME_CONFIG.ARENA_HEIGHT - padding * 2),
    };
  }
}
