import { Schema } from '@colyseus/schema';
export declare class Player extends Schema {
    id: string;
    name: string;
    x: number;
    y: number;
    rotation: number;
    turretRotation: number;
    health: number;
    kills: number;
    deaths: number;
    isAlive: boolean;
    lastInputSeq: number;
    respawnTime: number;
    lastFireTime: number;
}
//# sourceMappingURL=Player.d.ts.map