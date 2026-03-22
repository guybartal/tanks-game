import Phaser from 'phaser';
import { Tank } from '../entities/Tank';
import { Bullet } from '../entities/Bullet';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class GameScene extends Phaser.Scene {
  private player!: Tank;
  private bullets!: Phaser.Physics.Arcade.Group;
  
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.createArena();
    this.createPlayer();
    this.createBulletGroup();
    this.setupInput();
    this.setupMobileControls();
    
    // Debug text
    this.add.text(10, 10, 'WASD/Arrows: Move | Mouse: Aim | Click: Fire', {
      font: '14px monospace',
      color: '#9ca3af',
    });
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

  private createBulletGroup(): void {
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
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
    
    // Mouse/touch for aiming and firing
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isMobile || !this.isJoystickPointer(pointer)) {
        this.player.aimAt(pointer.worldX, pointer.worldY);
      }
    });
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isMobile || this.isFireAreaPointer(pointer)) {
        this.player.fire(this.bullets);
      }
    });
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
      } else if (this.isFireArea(pointer.x)) {
        // Aim with right side movement
        this.player.aimAt(pointer.worldX, pointer.worldY);
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer === this.joystickPointer) {
        this.joystickActive = false;
        this.joystickPointer = null;
        this.resetJoystick();
        this.player.setMoveInput(0, 0);
      }
    });
    
    // Fire button
    this.fireButton.on('pointerdown', () => {
      this.player.fire(this.bullets);
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
      this.player.setMoveInput(0, 0);
    } else {
      this.player.setMoveInput(inputX, inputY);
    }
  }

  private resetJoystick(): void {
    const centerX = 130;
    const centerY = GAME_HEIGHT - 100;
    this.joystickKnob.x = centerX;
    this.joystickKnob.y = centerY;
  }

  update(_time: number, delta: number): void {
    this.handleKeyboardInput();
    this.player.update(delta);
    
    // Clean up dead bullets
    this.bullets.getChildren().forEach((bullet) => {
      const b = bullet as Bullet;
      if (!b.active) {
        b.destroy();
      }
    });
  }

  private handleKeyboardInput(): void {
    if (this.joystickActive) return; // Mobile overrides keyboard
    
    let moveX = 0;
    let moveY = 0;
    
    // WASD
    if (this.wasd.A.isDown || this.cursors.left.isDown) moveX -= 1;
    if (this.wasd.D.isDown || this.cursors.right.isDown) moveX += 1;
    if (this.wasd.W.isDown || this.cursors.up.isDown) moveY -= 1;
    if (this.wasd.S.isDown || this.cursors.down.isDown) moveY += 1;
    
    this.player.setMoveInput(moveX, moveY);
  }
}
