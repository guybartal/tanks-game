// Shared TypeScript types for the server

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
