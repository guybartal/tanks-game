export * from './shared';
export interface Position {
    x: number;
    y: number;
}
export interface LegacyPlayer {
    id: string;
    name: string;
    score: number;
    position: Position;
    rotation: number;
    health: number;
}
export interface LegacyBullet {
    id: string;
    ownerId: string;
    position: Position;
    velocity: Position;
    createdAt: number;
}
export interface LegacyGameState {
    players: Map<string, LegacyPlayer>;
    bullets: LegacyBullet[];
    gameStarted: boolean;
    worldBounds: {
        width: number;
        height: number;
    };
}
export interface CollisionResult {
    bulletId: string;
    playerId: string;
    damage: number;
}
export type Player = LegacyPlayer;
export type Bullet = LegacyBullet;
export type GameState = LegacyGameState;
//# sourceMappingURL=index.d.ts.map