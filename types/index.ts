export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface Cell {
  id: number;
  name: string;
  level: Level;
  type: "normal" | "snake" | "arrow" | "special";
  jumpTo?: number;
  description: string;
  task?: string;
  reflection?: string; // "Спроси себя"
}

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number; // 0 = старт (не на поле)
  history: number[];
}

export type GamePhase = "idle" | "rolling" | "moving" | "resolving" | "ended";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: number | null;
  phase: GamePhase;
  winner: string | null;
  lastMove: {
    from: number;
    to: number;
    viaSnakeOrArrow?: number;
  } | null;
}
