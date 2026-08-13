import { CELLS, SNAKES, ARROWS } from "./cells";
import { GameState, Player } from "@/types";

export const BOARD_COLS = 8;
export const BOARD_ROWS = 9;
export const TOTAL_CELLS = 72;

export function createInitialState(playerNames: string[]): GameState {
  const colors = ["#c9a96e", "#4A7C59", "#2E5AAC", "#8B2635"];
  const players: Player[] = playerNames.map((name, i) => ({
    id: `p${i}`,
    name,
    color: colors[i % colors.length],
    position: 0,
    history: [],
  }));

  return {
    players,
    currentPlayerIndex: 0,
    dice: null,
    phase: "idle",
    winner: null,
    lastMove: null,
  };
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getCellCoords(cellId: number): { row: number; col: number } | null {
  if (cellId < 1 || cellId > TOTAL_CELLS) return null;
  const rowFromBottom = Math.floor((cellId - 1) / BOARD_COLS); // 0..8
  const row = BOARD_ROWS - 1 - rowFromBottom; // сверху вниз для отрисовки
  let col = (cellId - 1) % BOARD_COLS;
  if (rowFromBottom % 2 === 1) {
    col = BOARD_COLS - 1 - col; // змейка
  }
  return { row, col };
}

export function computeMove(state: GameState, dice: number): GameState {
  const player = { ...state.players[state.currentPlayerIndex] };
  const from = player.position;
  let to = from + dice;

  // Если перебросил — отскок
  if (to > TOTAL_CELLS) {
    to = TOTAL_CELLS - (to - TOTAL_CELLS);
  }

  const cell = CELLS[to - 1];
  let finalPos = to;
  let via: number | undefined;

  if (cell.type === "snake" && cell.jumpTo) {
    finalPos = cell.jumpTo;
    via = cell.jumpTo;
  } else if (cell.type === "arrow" && cell.jumpTo) {
    finalPos = cell.jumpTo;
    via = cell.jumpTo;
  }

  player.position = finalPos;
  player.history = [...player.history, finalPos];

  const newPlayers = [...state.players];
  newPlayers[state.currentPlayerIndex] = player;

  const winner = finalPos === TOTAL_CELLS ? player.id : state.winner;
  const nextIndex = winner !== null
    ? state.currentPlayerIndex
    : (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    players: newPlayers,
    dice,
    phase: winner ? "ended" : "idle",
    currentPlayerIndex: nextIndex,
    winner,
    lastMove: { from, to: finalPos, viaSnakeOrArrow: via },
  };
}

export function isSnake(cellId: number): boolean {
  return !!SNAKES[cellId];
}

export function isArrow(cellId: number): boolean {
  return !!ARROWS[cellId];
}
