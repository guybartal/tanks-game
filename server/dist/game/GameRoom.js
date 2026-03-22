"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const core_1 = require("@colyseus/core");
const GameState_1 = require("./GameState");
const Player_1 = require("./Player");
const Bullet_1 = require("./Bullet");
const shared_1 = require("../types/shared");
class GameRoom extends core_1.Room {
    constructor() {
        super(...arguments);
        this.bulletIdCounter = 0;
        this.tickInterval = null;
    }
    onCreate(_options) {
        console.log('GameRoom created:', this.roomId);
        this.setState(new GameState_1.GameState());
        this.maxClients = shared_1.GAME_CONFIG.MAX_PLAYERS_PER_ROOM;
        // Handle player input
        this.onMessage(shared_1.MESSAGE_TYPES.INPUT, (client, input) => {
            this.handleInput(client, input);
        });
        // Start the game loop
        this.startGameLoop();
    }
    onJoin(client, options) {
        console.log(`Player joined: ${client.sessionId}`);
        const player = new Player_1.Player();
        player.id = client.sessionId;
        player.name = options.name || `Player_${client.sessionId.slice(0, 4)}`;
        // Spawn at random position
        const spawn = this.getSpawnPosition();
        player.x = spawn.x;
        player.y = spawn.y;
        player.rotation = Math.random() * Math.PI * 2;
        player.turretRotation = player.rotation;
        player.health = shared_1.GAME_CONFIG.PLAYER_MAX_HEALTH;
        player.isAlive = true;
        this.state.players.set(client.sessionId, player);
        // Start game when we have at least 1 player (for testing)
        if (!this.state.gameStarted && this.state.players.size >= 1) {
            this.state.gameStarted = true;
            this.state.startTime = Date.now();
        }
    }
    onLeave(client, _code) {
        console.log(`Player left: ${client.sessionId}`);
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
        console.log('GameRoom disposed:', this.roomId);
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }
    }
    startGameLoop() {
        const tickMs = 1000 / shared_1.GAME_CONFIG.TICK_RATE;
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickMs);
    }
    tick() {
        if (!this.state.gameStarted)
            return;
        const deltaTime = 1 / shared_1.GAME_CONFIG.TICK_RATE;
        this.state.tickNumber++;
        // Update bullets
        this.updateBullets(deltaTime);
        // Check respawns
        this.checkRespawns();
        // Check collisions
        this.checkCollisions();
    }
    handleInput(client, input) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !player.isAlive)
            return;
        const deltaTime = 1 / shared_1.GAME_CONFIG.TICK_RATE;
        // Handle rotation
        if (input.left) {
            player.rotation -= shared_1.GAME_CONFIG.TANK_ROTATION_SPEED * deltaTime;
        }
        if (input.right) {
            player.rotation += shared_1.GAME_CONFIG.TANK_ROTATION_SPEED * deltaTime;
        }
        // Handle movement
        if (input.forward) {
            player.x += Math.cos(player.rotation) * shared_1.GAME_CONFIG.PLAYER_SPEED * deltaTime;
            player.y += Math.sin(player.rotation) * shared_1.GAME_CONFIG.PLAYER_SPEED * deltaTime;
        }
        if (input.backward) {
            player.x -= Math.cos(player.rotation) * shared_1.GAME_CONFIG.PLAYER_SPEED * deltaTime * 0.5;
            player.y -= Math.sin(player.rotation) * shared_1.GAME_CONFIG.PLAYER_SPEED * deltaTime * 0.5;
        }
        // Clamp to arena bounds
        player.x = Math.max(20, Math.min(shared_1.GAME_CONFIG.ARENA_WIDTH - 20, player.x));
        player.y = Math.max(20, Math.min(shared_1.GAME_CONFIG.ARENA_HEIGHT - 20, player.y));
        // Update turret rotation
        player.turretRotation = input.turretRotation;
        // Handle firing
        if (input.fire) {
            this.fireBullet(player);
        }
        // Update sequence for client reconciliation
        player.lastInputSeq = input.sequence;
    }
    fireBullet(player) {
        const now = Date.now();
        const fireRate = 200; // Minimum ms between shots
        if (now - player.lastFireTime < fireRate)
            return;
        player.lastFireTime = now;
        const bullet = new Bullet_1.Bullet();
        bullet.id = `${player.id}_${this.bulletIdCounter++}`;
        bullet.ownerId = player.id;
        // Spawn bullet at tank's turret position
        const turretLength = 30;
        bullet.x = player.x + Math.cos(player.turretRotation) * turretLength;
        bullet.y = player.y + Math.sin(player.turretRotation) * turretLength;
        bullet.velocityX = Math.cos(player.turretRotation) * shared_1.GAME_CONFIG.BULLET_SPEED;
        bullet.velocityY = Math.sin(player.turretRotation) * shared_1.GAME_CONFIG.BULLET_SPEED;
        bullet.createdAt = now;
        this.state.bullets.set(bullet.id, bullet);
    }
    updateBullets(deltaTime) {
        const now = Date.now();
        const bulletsToRemove = [];
        this.state.bullets.forEach((bullet, id) => {
            // Update position
            bullet.x += bullet.velocityX * deltaTime;
            bullet.y += bullet.velocityY * deltaTime;
            // Check if out of bounds or expired
            if (bullet.x < 0 || bullet.x > shared_1.GAME_CONFIG.ARENA_WIDTH ||
                bullet.y < 0 || bullet.y > shared_1.GAME_CONFIG.ARENA_HEIGHT ||
                now - bullet.createdAt > shared_1.GAME_CONFIG.BULLET_LIFETIME) {
                bulletsToRemove.push(id);
            }
        });
        bulletsToRemove.forEach(id => this.state.bullets.delete(id));
    }
    checkCollisions() {
        const bulletsToRemove = [];
        const tankRadius = 20;
        const bulletRadius = 5;
        this.state.bullets.forEach((bullet, bulletId) => {
            this.state.players.forEach((player) => {
                if (!player.isAlive)
                    return;
                if (player.id === bullet.ownerId)
                    return; // No self-damage
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
    damagePlayer(player, attackerId) {
        player.health -= shared_1.GAME_CONFIG.BULLET_DAMAGE;
        if (player.health <= 0) {
            player.health = 0;
            player.isAlive = false;
            player.deaths++;
            player.respawnTime = Date.now() + shared_1.GAME_CONFIG.RESPAWN_TIME;
            // Credit kill to attacker
            const attacker = this.state.players.get(attackerId);
            if (attacker) {
                attacker.kills++;
            }
            this.broadcast(shared_1.MESSAGE_TYPES.PLAYER_KILLED, {
                killedId: player.id,
                killedName: player.name,
                killerId: attackerId,
                killerName: attacker?.name || 'Unknown',
            });
        }
    }
    checkRespawns() {
        const now = Date.now();
        this.state.players.forEach((player) => {
            if (!player.isAlive && player.respawnTime > 0 && now >= player.respawnTime) {
                this.respawnPlayer(player);
            }
        });
    }
    respawnPlayer(player) {
        const spawn = this.getSpawnPosition();
        player.x = spawn.x;
        player.y = spawn.y;
        player.rotation = Math.random() * Math.PI * 2;
        player.turretRotation = player.rotation;
        player.health = shared_1.GAME_CONFIG.PLAYER_MAX_HEALTH;
        player.isAlive = true;
        player.respawnTime = 0;
        this.broadcast(shared_1.MESSAGE_TYPES.PLAYER_RESPAWNED, {
            playerId: player.id,
            playerName: player.name,
        });
    }
    getSpawnPosition() {
        const padding = 100;
        return {
            x: padding + Math.random() * (shared_1.GAME_CONFIG.ARENA_WIDTH - padding * 2),
            y: padding + Math.random() * (shared_1.GAME_CONFIG.ARENA_HEIGHT - padding * 2),
        };
    }
}
exports.GameRoom = GameRoom;
//# sourceMappingURL=GameRoom.js.map