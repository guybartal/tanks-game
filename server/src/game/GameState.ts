import { Schema, MapSchema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Bullet } from './Bullet';

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Bullet }) bullets = new MapSchema<Bullet>();
  @type('number') tickNumber: number = 0;
  @type('boolean') gameStarted: boolean = false;
  @type('number') startTime: number = 0;
}
