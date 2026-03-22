import Phaser from 'phaser';

export interface ServerBulletConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  bulletId: string;
  ownerId: string;
}

export class ServerBullet extends Phaser.GameObjects.Sprite {
  public bulletId: string;
  public ownerId: string;
  private targetX: number;
  private targetY: number;

  constructor(config: ServerBulletConfig) {
    super(config.scene, config.x, config.y, 'bullet');
    
    this.bulletId = config.bulletId;
    this.ownerId = config.ownerId;
    this.targetX = config.x;
    this.targetY = config.y;
    
    config.scene.add.existing(this);
  }

  updateFromServer(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  update(): void {
    // Interpolate position for smooth movement
    const lerpFactor = 0.5; // Faster lerp for bullets
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);
    
    // Calculate rotation from movement direction
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      this.rotation = Math.atan2(dy, dx);
    }
  }
}
