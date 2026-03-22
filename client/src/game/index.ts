import Phaser from 'phaser';
import { gameConfig } from './config';

let game: Phaser.Game | null = null;

export function createGame(): Phaser.Game {
  if (game) {
    game.destroy(true);
  }
  game = new Phaser.Game(gameConfig);
  return game;
}

export function destroyGame(): void {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

export { gameConfig } from './config';
