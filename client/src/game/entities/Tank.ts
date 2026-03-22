import Phaser from 'phaser';
import { Bullet } from './Bullet';

export interface TankConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  isPlayer?: boolean;
}

export class Tank extends Phaser.GameObjects.Container {
  private tankBody!: Phaser.GameObjects.Image;
  private turret!: Phaser.GameObjects.Image;
  
  // Movement properties
  private moveSpeed = 200;
  private rotationSpeed = 0.05;
  private acceleration = 800;
  private deceleration = 600;
  
  // Combat properties
  private fireRate = 250; // ms between shots
  private lastFired = 0;
  private bulletSpeed = 500;
  
  // Input state
  private moveInput = { x: 0, y: 0 };
  private targetAngle = 0;

  constructor(config: TankConfig) {
    super(config.scene, config.x, config.y);
    
    this.createTank();
    config.scene.add.existing(this);
    
    // Enable physics
    config.scene.physics.add.existing(this);
    const physicsBody = this.body as Phaser.Physics.Arcade.Body;
    physicsBody.setSize(40, 40);
    physicsBody.setCollideWorldBounds(true);
    physicsBody.setDrag(this.deceleration, this.deceleration);
    physicsBody.setMaxVelocity(this.moveSpeed, this.moveSpeed);
  }

  private createTank(): void {
    // Tank body
    this.tankBody = this.scene.add.image(0, 0, 'tank-body');
    this.add(this.tankBody);
    
    // Turret (renders on top)
    this.turret = this.scene.add.image(5, 0, 'tank-turret');
    this.turret.setOrigin(0.33, 0.5); // Pivot at turret base
    this.add(this.turret);
  }

  setMoveInput(x: number, y: number): void {
    // Normalize diagonal movement
    const length = Math.sqrt(x * x + y * y);
    if (length > 1) {
      this.moveInput.x = x / length;
      this.moveInput.y = y / length;
    } else {
      this.moveInput.x = x;
      this.moveInput.y = y;
    }
  }

  setTargetAngle(angle: number): void {
    this.targetAngle = angle;
  }

  setBodyRotation(angle: number): void {
    this.tankBody.rotation = angle;
  }

  aimAt(worldX: number, worldY: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, worldX, worldY);
    this.targetAngle = angle;
  }

  fire(bullets: Phaser.Physics.Arcade.Group): Bullet | null {
    const time = this.scene.time.now;
    
    if (time < this.lastFired + this.fireRate) {
      return null;
    }
    
    this.lastFired = time;
    
    // Calculate bullet spawn position at end of turret
    const turretLength = 35;
    const spawnX = this.x + Math.cos(this.turret.rotation) * turretLength;
    const spawnY = this.y + Math.sin(this.turret.rotation) * turretLength;
    
    const bullet = new Bullet({
      scene: this.scene,
      x: spawnX,
      y: spawnY,
      angle: this.turret.rotation,
      speed: this.bulletSpeed,
      group: bullets,
    });
    
    return bullet;
  }

  update(_delta: number): void {
    const physicsBody = this.body as Phaser.Physics.Arcade.Body;
    
    // Apply movement with acceleration
    if (this.moveInput.x !== 0 || this.moveInput.y !== 0) {
      physicsBody.setAcceleration(
        this.moveInput.x * this.acceleration,
        this.moveInput.y * this.acceleration
      );
      
      // Rotate body towards movement direction
      const moveAngle = Math.atan2(this.moveInput.y, this.moveInput.x);
      this.tankBody.rotation = Phaser.Math.Angle.RotateTo(
        this.tankBody.rotation,
        moveAngle,
        this.rotationSpeed
      );
    } else {
      physicsBody.setAcceleration(0, 0);
    }
    
    // Smoothly rotate turret towards target
    this.turret.rotation = Phaser.Math.Angle.RotateTo(
      this.turret.rotation,
      this.targetAngle,
      0.15
    );
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getTurretAngle(): number {
    return this.targetAngle;
  }
}
