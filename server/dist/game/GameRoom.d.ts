import { Room, Client, RoomOptions } from '@colyseus/core';
import { GameState } from './GameState';
interface TanksRoomOptions extends RoomOptions {
    state?: GameState;
}
export declare class GameRoom extends Room<TanksRoomOptions> {
    private bulletIdCounter;
    private tickInterval;
    onCreate(_options: Record<string, unknown>): void;
    onJoin(client: Client, options: {
        name?: string;
    }): void;
    onLeave(client: Client, _code?: number): void;
    onDispose(): void;
    private startGameLoop;
    private tick;
    private handleInput;
    private fireBullet;
    private updateBullets;
    private checkCollisions;
    private damagePlayer;
    private checkRespawns;
    private respawnPlayer;
    private getSpawnPosition;
}
export {};
//# sourceMappingURL=GameRoom.d.ts.map