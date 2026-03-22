// Tank game logic: movement, rotation, firing

export interface Position {
  x: number;
  y: number;
}

export interface TankState {
  position: Position;
  rotation: number;
  velocity: Position;
  health: number;
  lastFireTime: number;
}

export const TANK_SPEED = 3;
export const TANK_ROTATION_SPEED = 0.05;
export const FIRE_COOLDOWN_MS = 500;
export const MAX_HEALTH = 100;

export function createTank(x: number, y: number): TankState {
  return {
    position: { x, y },
    rotation: 0,
    velocity: { x: 0, y: 0 },
    health: MAX_HEALTH,
    lastFireTime: 0,
  };
}

export function normalizeAngle(angle: number): number {
  // Normalize angle to [-PI, PI]
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function rotateTank(tank: TankState, direction: 'left' | 'right'): number {
  const delta = direction === 'left' ? -TANK_ROTATION_SPEED : TANK_ROTATION_SPEED;
  tank.rotation = normalizeAngle(tank.rotation + delta);
  return tank.rotation;
}

export function calculateMovement(
  rotation: number,
  direction: 'forward' | 'backward'
): Position {
  const multiplier = direction === 'forward' ? 1 : -1;
  return {
    x: Math.cos(rotation) * TANK_SPEED * multiplier,
    y: Math.sin(rotation) * TANK_SPEED * multiplier,
  };
}

export function moveTank(
  tank: TankState,
  direction: 'forward' | 'backward',
  bounds?: { width: number; height: number }
): Position {
  const movement = calculateMovement(tank.rotation, direction);
  tank.velocity = movement;

  let newX = tank.position.x + movement.x;
  let newY = tank.position.y + movement.y;

  // Clamp to bounds if provided
  if (bounds) {
    const padding = 20; // Tank radius
    newX = Math.max(padding, Math.min(bounds.width - padding, newX));
    newY = Math.max(padding, Math.min(bounds.height - padding, newY));
  }

  tank.position.x = newX;
  tank.position.y = newY;

  return tank.position;
}

export function canFire(tank: TankState, currentTime: number): boolean {
  return currentTime - tank.lastFireTime >= FIRE_COOLDOWN_MS;
}

export function fireBullet(
  tank: TankState,
  currentTime: number
): { position: Position; rotation: number } | null {
  if (!canFire(tank, currentTime)) {
    return null;
  }

  tank.lastFireTime = currentTime;

  // Spawn bullet at tank's front
  const bulletOffset = 25; // Spawn slightly ahead of tank
  return {
    position: {
      x: tank.position.x + Math.cos(tank.rotation) * bulletOffset,
      y: tank.position.y + Math.sin(tank.rotation) * bulletOffset,
    },
    rotation: tank.rotation,
  };
}

export function getFireCooldownRemaining(
  tank: TankState,
  currentTime: number
): number {
  const elapsed = currentTime - tank.lastFireTime;
  return Math.max(0, FIRE_COOLDOWN_MS - elapsed);
}

export function takeDamage(tank: TankState, damage: number): boolean {
  tank.health = Math.max(0, tank.health - damage);
  return tank.health === 0;
}

export function resetTank(tank: TankState, x: number, y: number): void {
  tank.position = { x, y };
  tank.rotation = 0;
  tank.velocity = { x: 0, y: 0 };
  tank.health = MAX_HEALTH;
  tank.lastFireTime = 0;
}
