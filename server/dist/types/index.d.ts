export interface Player {
    id: string;
    name: string;
    score: number;
}
export interface GameState {
    players: Map<string, Player>;
    projectiles: unknown[];
    gameStarted: boolean;
}
//# sourceMappingURL=index.d.ts.map