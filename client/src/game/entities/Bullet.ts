import Phaser from 'phaser';

export interface BulletConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  angle: number;
  speed: number;
  group: Phaser.Physics.Arcade.Group;
}

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private lifespan = 2000; // ms before auto-destroy
  private spawnTime: number;

  constructor(config: BulletConfig) {
    super(config.scene, config.x, config.y, 'bullet');
    
    config.scene.add.existing(this);
    config.group.add(this);
    
    this.spawnTime = config.scene.time.now;
    this.rotation = config.angle;
    
    // Set velocity based on angle
    const velocityX = Math.cos(config.angle) * config.speed;
    const velocityY = Math.sin(config.angle) * config.speed;
    this.setVelocity(velocityX, velocityY);
    
    // Configure physics
    this.body?.setSize(6, 6);
  }

  update(time: number): void {
    // Auto-destroy after lifespan
    if (time > this.spawnTime + this.lifespan) {
      this.destroy();
      return;
    }
    
    // Destroy if out of bounds
    if (
      this.x < 0 ||
      this.x > this.scene.scale.width ||
      this.y < 0 ||
      this.y > this.scene.scale.height
    ) {
      this.destroy();
    }
  }
}
