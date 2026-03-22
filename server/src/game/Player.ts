import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') rotation: number = 0; // Tank body rotation
  @type('number') turretRotation: number = 0; // Turret aim direction
  @type('number') health: number = 100;
  @type('number') kills: number = 0;
  @type('number') deaths: number = 0;
  @type('boolean') isAlive: boolean = true;
  @type('number') lastInputSeq: number = 0; // For client reconciliation

  // Non-synced server-side state
  respawnTime: number = 0;
  lastFireTime: number = 0;
}
