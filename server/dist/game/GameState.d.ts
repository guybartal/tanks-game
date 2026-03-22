import { Schema, MapSchema } from '@colyseus/schema';
import { Player } from './Player';
import { Bullet } from './Bullet';
export declare class GameState extends Schema {
    players: MapSchema<Player, string>;
    bullets: MapSchema<Bullet, string>;
    tickNumber: number;
    gameStarted: boolean;
    startTime: number;
}
//# sourceMappingURL=GameState.d.ts.map