/**
 * Shared types for client-server communication
 * These types are used by both Colyseus state and client code
 */
export interface PlayerInput {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    fire: boolean;
    turretRotation: number;
    sequence: number;
}
export declare const GAME_CONFIG: {
    readonly TICK_RATE: 60;
    readonly PLAYER_SPEED: 150;
    readonly TANK_ROTATION_SPEED: 3;
    readonly BULLET_SPEED: 400;
    readonly BULLET_LIFETIME: 3000;
    readonly PLAYER_MAX_HEALTH: 100;
    readonly BULLET_DAMAGE: 25;
    readonly RESPAWN_TIME: 3000;
    readonly MAX_PLAYERS_PER_ROOM: 8;
    readonly ARENA_WIDTH: 1600;
    readonly ARENA_HEIGHT: 1200;
};
export declare const MESSAGE_TYPES: {
    readonly INPUT: "input";
    readonly CHAT: "chat";
    readonly GAME_OVER: "gameOver";
    readonly PLAYER_KILLED: "playerKilled";
    readonly PLAYER_RESPAWNED: "playerRespawned";
};
export interface MatchResult {
    winnerId: string;
    winnerName: string;
    scores: Array<{
        playerId: string;
        playerName: string;
        kills: number;
        deaths: number;
    }>;
    duration: number;
}
//# sourceMappingURL=shared.d.ts.map