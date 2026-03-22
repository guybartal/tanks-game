import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTank,
  rotateTank,
  calculateMovement,
  moveTank,
  canFire,
  fireBullet,
  getFireCooldownRemaining,
  takeDamage,
  resetTank,
  normalizeAngle,
  TANK_SPEED,
  TANK_ROTATION_SPEED,
  FIRE_COOLDOWN_MS,
  MAX_HEALTH,
  type TankState,
} from '../Tank';

describe('Tank', () => {
  let tank: TankState;

  beforeEach(() => {
    tank = createTank(100, 100);
  });

  describe('createTank', () => {
    it('should create a tank with correct initial position', () => {
      expect(tank.position.x).toBe(100);
      expect(tank.position.y).toBe(100);
    });

    it('should initialize with zero rotation', () => {
      expect(tank.rotation).toBe(0);
    });

    it('should initialize with zero velocity', () => {
      expect(tank.velocity.x).toBe(0);
      expect(tank.velocity.y).toBe(0);
    });

    it('should initialize with full health', () => {
      expect(tank.health).toBe(MAX_HEALTH);
    });

    it('should initialize with zero fire time', () => {
      expect(tank.lastFireTime).toBe(0);
    });
  });

  describe('Rotation', () => {
    describe('normalizeAngle', () => {
      it('should keep angles in range', () => {
        expect(normalizeAngle(0)).toBe(0);
        expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
      });

      it('should normalize angles greater than PI', () => {
        expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0);
        expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      });

      it('should normalize angles less than -PI', () => {
        expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0);
        expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI);
      });
    });

    describe('rotateTank', () => {
      it('should rotate left (counterclockwise)', () => {
        rotateTank(tank, 'left');
        expect(tank.rotation).toBe(-TANK_ROTATION_SPEED);
      });

      it('should rotate right (clockwise)', () => {
        rotateTank(tank, 'right');
        expect(tank.rotation).toBe(TANK_ROTATION_SPEED);
      });

      it('should accumulate rotation', () => {
        rotateTank(tank, 'right');
        rotateTank(tank, 'right');
        expect(tank.rotation).toBeCloseTo(TANK_ROTATION_SPEED * 2);
      });

      it('should normalize rotation on overflow', () => {
        // Rotate many times
        for (let i = 0; i < 200; i++) {
          rotateTank(tank, 'right');
        }
        expect(tank.rotation).toBeGreaterThanOrEqual(-Math.PI);
        expect(tank.rotation).toBeLessThanOrEqual(Math.PI);
      });
    });
  });

  describe('Movement', () => {
    describe('calculateMovement', () => {
      it('should move right when rotation is 0', () => {
        const movement = calculateMovement(0, 'forward');
        expect(movement.x).toBeCloseTo(TANK_SPEED);
        expect(movement.y).toBeCloseTo(0);
      });

      it('should move down when rotation is PI/2', () => {
        const movement = calculateMovement(Math.PI / 2, 'forward');
        expect(movement.x).toBeCloseTo(0);
        expect(movement.y).toBeCloseTo(TANK_SPEED);
      });

      it('should move left when rotation is PI', () => {
        const movement = calculateMovement(Math.PI, 'forward');
        expect(movement.x).toBeCloseTo(-TANK_SPEED);
        expect(movement.y).toBeCloseTo(0);
      });

      it('should move opposite direction when backward', () => {
        const forward = calculateMovement(0, 'forward');
        const backward = calculateMovement(0, 'backward');
        expect(backward.x).toBeCloseTo(-forward.x);
        expect(backward.y).toBeCloseTo(-forward.y);
      });
    });

    describe('moveTank', () => {
      it('should update tank position', () => {
        moveTank(tank, 'forward');
        expect(tank.position.x).toBeCloseTo(100 + TANK_SPEED);
        expect(tank.position.y).toBeCloseTo(100);
      });

      it('should update tank velocity', () => {
        moveTank(tank, 'forward');
        expect(tank.velocity.x).toBeCloseTo(TANK_SPEED);
        expect(tank.velocity.y).toBeCloseTo(0);
      });

      it('should respect bounds', () => {
        tank.position.x = 10;
        moveTank(tank, 'backward', { width: 800, height: 600 });
        expect(tank.position.x).toBe(20); // Clamped to padding
      });

      it('should not exceed right bound', () => {
        tank.position.x = 795;
        moveTank(tank, 'forward', { width: 800, height: 600 });
        expect(tank.position.x).toBe(780); // Clamped to width - padding
      });
    });
  });

  describe('Firing', () => {
    describe('canFire', () => {
      it('should allow firing when cooldown has passed', () => {
        expect(canFire(tank, FIRE_COOLDOWN_MS + 1)).toBe(true);
      });

      it('should prevent firing during cooldown', () => {
        tank.lastFireTime = 1000;
        expect(canFire(tank, 1000 + FIRE_COOLDOWN_MS - 1)).toBe(false);
      });

      it('should allow firing exactly at cooldown end', () => {
        tank.lastFireTime = 1000;
        expect(canFire(tank, 1000 + FIRE_COOLDOWN_MS)).toBe(true);
      });
    });

    describe('fireBullet', () => {
      it('should return bullet data when allowed', () => {
        const bullet = fireBullet(tank, FIRE_COOLDOWN_MS + 100);
        expect(bullet).not.toBeNull();
        expect(bullet!.rotation).toBe(0);
      });

      it('should spawn bullet ahead of tank', () => {
        const bullet = fireBullet(tank, FIRE_COOLDOWN_MS + 100);
        expect(bullet!.position.x).toBeGreaterThan(tank.position.x);
      });

      it('should return null during cooldown', () => {
        fireBullet(tank, 1000);
        const secondBullet = fireBullet(tank, 1100);
        expect(secondBullet).toBeNull();
      });

      it('should update lastFireTime', () => {
        fireBullet(tank, 5000);
        expect(tank.lastFireTime).toBe(5000);
      });

      it('should spawn bullet in direction tank is facing', () => {
        tank.rotation = Math.PI / 2; // Facing down
        const bullet = fireBullet(tank, FIRE_COOLDOWN_MS + 100);
        expect(bullet!.position.y).toBeGreaterThan(tank.position.y);
        expect(bullet!.position.x).toBeCloseTo(tank.position.x);
      });
    });

    describe('getFireCooldownRemaining', () => {
      it('should return full cooldown immediately after firing', () => {
        tank.lastFireTime = 1000;
        expect(getFireCooldownRemaining(tank, 1000)).toBe(FIRE_COOLDOWN_MS);
      });

      it('should return reduced cooldown over time', () => {
        tank.lastFireTime = 1000;
        expect(getFireCooldownRemaining(tank, 1200)).toBe(FIRE_COOLDOWN_MS - 200);
      });

      it('should return 0 when cooldown is complete', () => {
        tank.lastFireTime = 1000;
        expect(getFireCooldownRemaining(tank, 2000)).toBe(0);
      });
    });
  });

  describe('Damage', () => {
    describe('takeDamage', () => {
      it('should reduce health', () => {
        takeDamage(tank, 25);
        expect(tank.health).toBe(MAX_HEALTH - 25);
      });

      it('should not go below 0', () => {
        takeDamage(tank, 200);
        expect(tank.health).toBe(0);
      });

      it('should return true when killed', () => {
        const killed = takeDamage(tank, MAX_HEALTH);
        expect(killed).toBe(true);
      });

      it('should return false when surviving', () => {
        const killed = takeDamage(tank, 10);
        expect(killed).toBe(false);
      });
    });
  });

  describe('resetTank', () => {
    it('should reset position', () => {
      tank.position = { x: 500, y: 500 };
      resetTank(tank, 200, 200);
      expect(tank.position.x).toBe(200);
      expect(tank.position.y).toBe(200);
    });

    it('should reset rotation', () => {
      tank.rotation = Math.PI;
      resetTank(tank, 100, 100);
      expect(tank.rotation).toBe(0);
    });

    it('should reset health', () => {
      tank.health = 10;
      resetTank(tank, 100, 100);
      expect(tank.health).toBe(MAX_HEALTH);
    });

    it('should reset velocity and fire time', () => {
      tank.velocity = { x: 5, y: 5 };
      tank.lastFireTime = 5000;
      resetTank(tank, 100, 100);
      expect(tank.velocity.x).toBe(0);
      expect(tank.velocity.y).toBe(0);
      expect(tank.lastFireTime).toBe(0);
    });
  });
});
