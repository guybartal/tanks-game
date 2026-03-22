import { Client, Room } from 'colyseus.js';

// Types matching server schema
export interface PlayerState {
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
}

export interface BulletState {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  createdAt: number;
}

export interface GameStateData {
  players: Map<string, PlayerState>;
  bullets: Map<string, BulletState>;
  tickNumber: number;
  gameStarted: boolean;
  startTime: number;
}

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  turretRotation: number;
  sequence: number;
}

export type NetworkEventListener = {
  onPlayerJoin?: (player: PlayerState) => void;
  onPlayerLeave?: (playerId: string) => void;
  onPlayerUpdate?: (player: PlayerState) => void;
  onBulletAdd?: (bullet: BulletState) => void;
  onBulletRemove?: (bulletId: string) => void;
  onStateUpdate?: (state: GameStateData) => void;
  onPlayerKilled?: (data: { killedId: string; killedName: string; killerId: string; killerName: string }) => void;
  onPlayerRespawned?: (data: { playerId: string; playerName: string }) => void;
};

class NetworkService {
  private client: Client | null = null;
  private room: Room | null = null;
  private listeners: NetworkEventListener = {};
  private inputSequence = 0;
  private _sessionId: string | null = null;

  get sessionId(): string | null {
    return this._sessionId;
  }

  get isConnected(): boolean {
    return this.room !== null;
  }

  async connect(serverUrl: string = 'ws://localhost:3000', playerName?: string): Promise<void> {
    try {
      this.client = new Client(serverUrl);
      
      this.room = await this.client.joinOrCreate('tanks', {
        name: playerName || `Player_${Math.random().toString(36).slice(2, 6)}`,
      });

      this._sessionId = this.room.sessionId;
      console.log('Connected to game room:', this.room.roomId, 'as', this._sessionId);

      this.setupStateListeners();
      this.setupMessageListeners();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      throw error;
    }
  }

  private setupStateListeners(): void {
    if (!this.room) return;

    // Listen for player additions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.room.state.players.onAdd((player: any, sessionId: string) => {
      console.log('Player joined:', sessionId, player.name);
      this.listeners.onPlayerJoin?.(player as PlayerState);

      // Listen for changes on this player
      player.onChange?.(() => {
        this.listeners.onPlayerUpdate?.(player as PlayerState);
      });
    });

    // Listen for player removals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.room.state.players.onRemove((_player: any, sessionId: string) => {
      console.log('Player left:', sessionId);
      this.listeners.onPlayerLeave?.(sessionId);
    });

    // Listen for bullet additions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.room.state.bullets.onAdd((bullet: any, bulletId: string) => {
      console.log('Bullet fired:', bulletId);
      this.listeners.onBulletAdd?.(bullet as BulletState);

      bullet.onChange?.(() => {
        // Bullets update position via state sync
      });
    });

    // Listen for bullet removals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.room.state.bullets.onRemove((_bullet: any, bulletId: string) => {
      this.listeners.onBulletRemove?.(bulletId);
    });

    // General state change
    this.room.state.onChange(() => {
      const state: GameStateData = {
        players: this.room!.state.players,
        bullets: this.room!.state.bullets,
        tickNumber: this.room!.state.tickNumber,
        gameStarted: this.room!.state.gameStarted,
        startTime: this.room!.state.startTime,
      };
      this.listeners.onStateUpdate?.(state);
    });
  }

  private setupMessageListeners(): void {
    if (!this.room) return;

    this.room.onMessage('playerKilled', (data) => {
      this.listeners.onPlayerKilled?.(data);
    });

    this.room.onMessage('playerRespawned', (data) => {
      this.listeners.onPlayerRespawned?.(data);
    });
  }

  setListeners(listeners: NetworkEventListener): void {
    this.listeners = listeners;
  }

  sendInput(input: Omit<PlayerInput, 'sequence'>): void {
    if (!this.room) return;

    this.inputSequence++;
    const fullInput: PlayerInput = {
      ...input,
      sequence: this.inputSequence,
    };

    this.room.send('input', fullInput);
  }

  disconnect(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    this._sessionId = null;
    this.client = null;
  }

  getPlayers(): Map<string, PlayerState> | null {
    return this.room?.state.players ?? null;
  }

  getBullets(): Map<string, BulletState> | null {
    return this.room?.state.bullets ?? null;
  }
}

// Singleton instance
export const networkService = new NetworkService();
