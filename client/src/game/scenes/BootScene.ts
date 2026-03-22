import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4ade80, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate tank texture programmatically
    this.createTankTexture();
    this.createTurretTexture();
    this.createBulletTexture();
    this.createJoystickTextures();
  }

  createTankTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Tank body - green rectangle with darker tracks
    graphics.fillStyle(0x22c55e);
    graphics.fillRect(0, 5, 40, 30);
    
    // Tracks
    graphics.fillStyle(0x166534);
    graphics.fillRect(0, 0, 40, 8);
    graphics.fillRect(0, 32, 40, 8);
    
    graphics.generateTexture('tank-body', 40, 40);
    graphics.destroy();
  }

  createTurretTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Turret base (circle)
    graphics.fillStyle(0x16a34a);
    graphics.fillCircle(15, 15, 12);
    
    // Cannon barrel
    graphics.fillStyle(0x15803d);
    graphics.fillRect(20, 12, 25, 6);
    
    graphics.generateTexture('tank-turret', 45, 30);
    graphics.destroy();
  }

  createBulletTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    graphics.fillStyle(0xfbbf24);
    graphics.fillCircle(4, 4, 4);
    
    graphics.generateTexture('bullet', 8, 8);
    graphics.destroy();
  }

  createJoystickTextures(): void {
    // Joystick base
    const base = this.make.graphics({ x: 0, y: 0 });
    base.fillStyle(0x374151, 0.5);
    base.fillCircle(60, 60, 60);
    base.lineStyle(3, 0x6b7280, 0.8);
    base.strokeCircle(60, 60, 60);
    base.generateTexture('joystick-base', 120, 120);
    base.destroy();

    // Joystick knob
    const knob = this.make.graphics({ x: 0, y: 0 });
    knob.fillStyle(0x4b5563, 0.9);
    knob.fillCircle(25, 25, 25);
    knob.lineStyle(2, 0x9ca3af, 1);
    knob.strokeCircle(25, 25, 25);
    knob.generateTexture('joystick-knob', 50, 50);
    knob.destroy();

    // Fire button
    const fireBtn = this.make.graphics({ x: 0, y: 0 });
    fireBtn.fillStyle(0xef4444, 0.7);
    fireBtn.fillCircle(40, 40, 40);
    fireBtn.lineStyle(3, 0xfca5a5, 0.9);
    fireBtn.strokeCircle(40, 40, 40);
    fireBtn.generateTexture('fire-button', 80, 80);
    fireBtn.destroy();
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
