import Phaser from 'phaser';
import { Tank } from '../entities/Tank';
import { RemoteTank } from '../entities/RemoteTank';
import { ServerBullet } from '../entities/ServerBullet';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { networkService, type PlayerState, type BulletState } from '../../network';

export class GameScene extends Phaser.Scene {
  private player!: Tank;
  private remoteTanks: Map<string, RemoteTank> = new Map();
  private serverBullets: Map<string, ServerBullet> = new Map();
  private isMultiplayer = false;
  private pendingSpawn: { x: number; y: number } | null = null;
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  
  // Mobile controls
  private isMobile = false;
  private joystickBase!: Phaser.GameObjects.Image;
  private joystickKnob!: Phaser.GameObjects.Image;
  private fireButton!: Phaser.GameObjects.Image;
  private joystickActive = false;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickInputX = 0;
  private joystickInputY = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  async create(): Promise<void> {
    this.createArena();
    this.setupInput();
    this.setupMobileControls();
    
    // Debug text
    this.add.text(10, 10, 'WASD/Arrows: Move | Mouse: Aim | Click/Space: Fire', {
      font: '14px monospace',
      color: '#9ca3af',
    });

    // Connect to multiplayer server
    await this.connectToServer();
  }

  private async connectToServer(): Promise<void> {
    const statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Connecting...', {
      font: '24px monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    try {
      // Setup network event listeners
      networkService.setListeners({
        onPlayerJoin: (player: PlayerState) => this.handlePlayerJoin(player),
        onPlayerLeave: (playerId: string) => this.handlePlayerLeave(playerId),
        onPlayerUpdate: (player: PlayerState) => this.handlePlayerUpdate(player),
        onBulletAdd: (bullet: BulletState) => this.handleBulletAdd(bullet),
        onBulletRemove: (bulletId: string) => this.handleBulletRemove(bulletId),
        onPlayerKilled: (data) => this.handlePlayerKilled(data),
        onPlayerRespawned: (data) => this.handlePlayerRespawned(data),
      });

      // Connect to server
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3000';
      await networkService.connect(serverUrl);
      
      this.isMultiplayer = true;
      statusText.destroy();
      
      // Create local player tank at server's spawn position
      this.createPlayer();
      if (this.pendingSpawn) {
        this.player.setPosition(this.pendingSpawn.x, this.pendingSpawn.y);
        this.pendingSpawn = null;
      }
      
    } catch (error) {
      console.error('Failed to connect:', error);
      statusText.setText('Connection failed - Playing offline');
      this.time.delayedCall(2000, () => {
        statusText.destroy();
        this.createPlayer();
      });
    }
  }

  private handlePlayerJoin(player: PlayerState): void {
    // Don't create a remote tank for ourselves
    if (player.id === networkService.sessionId) {
      console.log('Local player joined, updating position');
      if (this.player) {
        this.player.setPosition(player.x, player.y);
      } else {
        this.pendingSpawn = { x: player.x, y: player.y };
      }
      return;
    }

    console.log('Remote player joined:', player.name);
    
    // Create remote tank for new player
    const remoteTank = new RemoteTank({
      scene: this,
      x: player.x,
      y: player.y,
      playerId: player.id,
      playerName: player.name,
    });
    
    this.remoteTanks.set(player.id, remoteTank);
  }

  private handlePlayerLeave(playerId: string): void {
    const remoteTank = this.remoteTanks.get(playerId);
    if (remoteTank) {
      remoteTank.destroy();
      this.remoteTanks.delete(playerId);
    }
  }

  private handlePlayerUpdate(player: PlayerState): void {
    // Update remote tank
    const remoteTank = this.remoteTanks.get(player.id);
    if (remoteTank) {
      remoteTank.updateFromServer(
        player.x,
        player.y,
        player.rotation,
        player.turretRotation,
        player.health,
        player.isAlive
      );
    }
  }

  private handleBulletAdd(bullet: BulletState): void {
    const serverBullet = new ServerBullet({
      scene: this,
      x: bullet.x,
      y: bullet.y,
      bulletId: bullet.id,
      ownerId: bullet.ownerId,
    });
    
    this.serverBullets.set(bullet.id, serverBullet);
  }

  private handleBulletRemove(bulletId: string): void {
    const serverBullet = this.serverBullets.get(bulletId);
    if (serverBullet) {
      serverBullet.destroy();
      this.serverBullets.delete(bulletId);
    }
  }

  private handlePlayerKilled(data: { killedId: string; killedName: string; killerId: string; killerName: string }): void {
    // Show kill notification
    const text = `${data.killerName} killed ${data.killedName}`;
    const notification = this.add.text(GAME_WIDTH / 2, 50, text, {
      font: '18px monospace',
      color: '#ef4444',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => notification.destroy());
  }

  private handlePlayerRespawned(data: { playerId: string; playerName: string }): void {
    const text = `${data.playerName} respawned`;
    const notification = this.add.text(GAME_WIDTH / 2, 80, text, {
      font: '14px monospace',
      color: '#4ade80',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    
    this.time.delayedCall(1500, () => notification.destroy());
  }

  private createArena(): void {
    // Simple arena background with grid
    const graphics = this.add.graphics();
    
    // Grid pattern
    graphics.lineStyle(1, 0x2d3748, 0.3);
    const gridSize = 50;
    
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, GAME_HEIGHT);
    }
    
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(GAME_WIDTH, y);
    }
    
    graphics.strokePath();
    
    // Arena border
    graphics.lineStyle(4, 0x4ade80, 1);
    graphics.strokeRect(2, 2, GAME_WIDTH - 4, GAME_HEIGHT - 4);
  }

  private createPlayer(): void {
    this.player = new Tank({
      scene: this,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      isPlayer: true,
    });
  }

  private setupInput(): void {
    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    // Mouse/touch for aiming
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.player && (!this.isMobile || !this.isJoystickPointer(pointer))) {
        this.player.aimAt(pointer.worldX, pointer.worldY);
      }
    });
    
    // Firing is handled in update() via sendInputToServer()
  }

  private setupMobileControls(): void {
    // Detect mobile/touch device
    this.isMobile = this.input.activePointer.wasTouch ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;
    
    if (!this.isMobile) return;

    // Update instructions for mobile
    this.add.text(10, 30, 'Left: Move | Right: Aim & Tap to Fire', {
      font: '14px monospace',
      color: '#9ca3af',
    });

    const padding = 30;
    const joystickY = GAME_HEIGHT - 100;
    
    // Virtual joystick (left side)
    this.joystickBase = this.add.image(100 + padding, joystickY, 'joystick-base');
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(100);
    this.joystickBase.setAlpha(0.6);
    
    this.joystickKnob = this.add.image(100 + padding, joystickY, 'joystick-knob');
    this.joystickKnob.setScrollFactor(0);
    this.joystickKnob.setDepth(101);
    this.joystickKnob.setAlpha(0.8);
    
    // Fire button (right side)
    this.fireButton = this.add.image(GAME_WIDTH - 80 - padding, joystickY, 'fire-button');
    this.fireButton.setScrollFactor(0);
    this.fireButton.setDepth(100);
    this.fireButton.setInteractive();
    
    // Joystick touch handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isJoystickArea(pointer.x, pointer.y)) {
        this.joystickActive = true;
        this.joystickPointer = pointer;
        this.updateJoystick(pointer);
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer === this.joystickPointer) {
        this.updateJoystick(pointer);
      } else if (this.player && this.isFireArea(pointer.x)) {
        // Aim with right side movement
        this.player.aimAt(pointer.worldX, pointer.worldY);
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer === this.joystickPointer) {
        this.joystickActive = false;
        this.joystickPointer = null;
        this.joystickInputX = 0;
        this.joystickInputY = 0;
        this.resetJoystick();
        if (this.player) {
          this.player.setMoveInput(0, 0);
        }
      }
    });
    
    // Fire button - in multiplayer, fire is sent via input
    this.fireButton.on('pointerdown', () => {
      this.fireButton.setScale(0.9);
    });
    
    this.fireButton.on('pointerup', () => {
      this.fireButton.setScale(1);
    });
  }

  private isJoystickArea(x: number, y: number): boolean {
    const centerX = 130;
    const centerY = GAME_HEIGHT - 100;
    const radius = 80;
    const dist = Phaser.Math.Distance.Between(x, y, centerX, centerY);
    return dist <= radius;
  }

  private isFireArea(x: number): boolean {
    return x > GAME_WIDTH / 2;
  }

  private isJoystickPointer(pointer: Phaser.Input.Pointer): boolean {
    return pointer === this.joystickPointer;
  }

  private isFireAreaPointer(pointer: Phaser.Input.Pointer): boolean {
    return pointer.x > GAME_WIDTH / 2 && pointer !== this.joystickPointer;
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const centerX = 130;
    const centerY = GAME_HEIGHT - 100;
    const maxDist = 50;
    
    let dx = pointer.x - centerX;
    let dy = pointer.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Clamp to max distance
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    this.joystickKnob.x = centerX + dx;
    this.joystickKnob.y = centerY + dy;
    
    // Normalize to -1 to 1
    const inputX = dx / maxDist;
    const inputY = dy / maxDist;
    
    // Dead zone
    const deadZone = 0.15;
    if (Math.abs(inputX) < deadZone && Math.abs(inputY) < deadZone) {
      this.joystickInputX = 0;
      this.joystickInputY = 0;
      if (this.player) this.player.setMoveInput(0, 0);
    } else {
      this.joystickInputX = inputX;
      this.joystickInputY = inputY;
      if (this.player) this.player.setMoveInput(inputX, inputY);
    }
  }

  private resetJoystick(): void {
    const centerX = 130;
    const centerY = GAME_HEIGHT - 100;
    this.joystickKnob.x = centerX;
    this.joystickKnob.y = centerY;
  }

  private getJoystickX(): number {
    return this.joystickInputX;
  }

  private getJoystickY(): number {
    return this.joystickInputY;
  }

  update(_time: number, delta: number): void {
    if (!this.player) return;
    
    this.handleKeyboardInput();
    this.player.update(delta);
    
    // Send input to server if multiplayer
    if (this.isMultiplayer) {
      this.sendInputToServer();
      this.syncFromServer();
    }
    
    // Update remote tanks (lerp towards targets)
    this.remoteTanks.forEach((tank) => {
      tank.update(delta);
    });
    
    // Update server bullets
    this.updateServerBullets();
  }

  private syncFromServer(): void {
    const players = networkService.getPlayers();
    if (!players) return;

    players.forEach((player: PlayerState, sessionId: string) => {
      if (sessionId === networkService.sessionId) {
        // Sync local player to server-authoritative position
        this.player.setPosition(player.x, player.y);
        this.player.setBodyRotation(player.rotation);
        return;
      }
      const remoteTank = this.remoteTanks.get(sessionId);
      if (remoteTank) {
        remoteTank.updateFromServer(
          player.x, player.y,
          player.rotation, player.turretRotation,
          player.health, player.isAlive
        );
      }
    });
  }

  private sendInputToServer(): void {
    // Check keyboard/joystick state for movement
    let forward = false;
    let backward = false;
    let left = false;
    let right = false;
    
    if (this.joystickActive) {
      // Convert joystick analog input to digital directions
      const jx = this.getJoystickX();
      const jy = this.getJoystickY();
      const deadZone = 0.15;
      left = jx < -deadZone;
      right = jx > deadZone;
      forward = jy < -deadZone;
      backward = jy > deadZone;
    } else {
      // Keyboard input
      forward = this.wasd.W.isDown || this.cursors.up.isDown;
      backward = this.wasd.S.isDown || this.cursors.down.isDown;
      left = this.wasd.A.isDown || this.cursors.left.isDown;
      right = this.wasd.D.isDown || this.cursors.right.isDown;
    }
    
    // Check for fire input (mouse click, space bar, or fire button)
    const pointerFire = this.input.activePointer.isDown &&
      (!this.joystickActive || this.isFireAreaPointer(this.input.activePointer));
    const fire = this.cursors.space.isDown || pointerFire;
    
    // Get turret rotation
    const turretRotation = this.player.getTurretAngle();
    
    networkService.sendInput({
      forward,
      backward,
      left,
      right,
      fire,
      turretRotation,
    });
  }

  private updateServerBullets(): void {
    const bullets = networkService.getBullets();
    if (!bullets) return;
    
    // Update existing bullets
    bullets.forEach((bulletState, bulletId) => {
      const serverBullet = this.serverBullets.get(bulletId);
      if (serverBullet) {
        serverBullet.updateFromServer(bulletState.x, bulletState.y);
        serverBullet.update();
      }
    });
  }

  private handleKeyboardInput(): void {
    if (this.joystickActive) return; // Mobile overrides keyboard
    // In multiplayer, movement is server-authoritative (syncFromServer handles position)
    if (this.isMultiplayer) return;
    
    let moveX = 0;
    let moveY = 0;
    
    if (this.wasd.A.isDown || this.cursors.left.isDown) moveX -= 1;
    if (this.wasd.D.isDown || this.cursors.right.isDown) moveX += 1;
    if (this.wasd.W.isDown || this.cursors.up.isDown) moveY -= 1;
    if (this.wasd.S.isDown || this.cursors.down.isDown) moveY += 1;
    
    this.player.setMoveInput(moveX, moveY);
  }
}
