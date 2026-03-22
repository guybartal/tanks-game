import Phaser from 'phaser';

export interface RemoteTankConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  playerId: string;
  playerName: string;
}

export class RemoteTank extends Phaser.GameObjects.Container {
  private tankBody!: Phaser.GameObjects.Image;
  private turret!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  
  public playerId: string;
  public playerName: string;
  private targetX: number;
  private targetY: number;
  private targetRotation: number;
  private targetTurretRotation: number;
  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private isAlive: boolean = true;

  constructor(config: RemoteTankConfig) {
    super(config.scene, config.x, config.y);
    
    this.playerId = config.playerId;
    this.playerName = config.playerName;
    this.targetX = config.x;
    this.targetY = config.y;
    this.targetRotation = 0;
    this.targetTurretRotation = 0;
    
    this.createTank();
    this.createNameTag();
    this.createHealthBar();
    
    config.scene.add.existing(this);
  }

  private createTank(): void {
    // Tank body (slightly different color to distinguish from player)
    this.tankBody = this.scene.add.image(0, 0, 'tank-body');
    this.tankBody.setTint(0xff6b6b); // Red tint for enemies
    this.add(this.tankBody);
    
    // Turret
    this.turret = this.scene.add.image(5, 0, 'tank-turret');
    this.turret.setOrigin(0.33, 0.5);
    this.turret.setTint(0xff6b6b);
    this.add(this.turret);
  }

  private createNameTag(): void {
    this.nameText = this.scene.add.text(0, -40, this.playerName, {
      font: '12px monospace',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5, 0.5);
    this.add(this.nameText);
  }

  private createHealthBar(): void {
    this.healthBar = this.scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    
    const barWidth = 40;
    const barHeight = 4;
    const x = -barWidth / 2;
    const y = -50;
    
    // Background
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health fill
    const healthPercent = this.currentHealth / this.maxHealth;
    const healthColor = healthPercent > 0.5 ? 0x4ade80 : healthPercent > 0.25 ? 0xfbbf24 : 0xef4444;
    this.healthBar.fillStyle(healthColor, 1);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
  }

  updateFromServer(
    x: number, 
    y: number, 
    rotation: number, 
    turretRotation: number, 
    health: number,
    isAlive: boolean
  ): void {
    this.targetX = x;
    this.targetY = y;
    this.targetRotation = rotation;
    this.targetTurretRotation = turretRotation;
    this.currentHealth = health;
    this.isAlive = isAlive;
    
    this.setVisible(isAlive);
    this.updateHealthBar();
  }

  update(_delta: number): void {
    if (!this.isAlive) return;

    // Interpolate position for smooth movement
    const lerpFactor = 0.2;
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);
    
    // Interpolate rotations
    this.tankBody.rotation = Phaser.Math.Angle.RotateTo(
      this.tankBody.rotation,
      this.targetRotation,
      0.15
    );
    this.turret.rotation = Phaser.Math.Angle.RotateTo(
      this.turret.rotation,
      this.targetTurretRotation,
      0.15
    );
  }
}
