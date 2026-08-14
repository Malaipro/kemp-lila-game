import { CELLS, SNAKES, ARROWS } from "./cells";
import { GameState, Player, CellProgress } from "@/types";

export const BOARD_COLS = 8;
export const BOARD_ROWS = 9;
export const TOTAL_CELLS = 72;
export const CELL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 часа

export function createInitialState(playerNames: string[]): GameState {
  const colors = ["#c9a96e", "#4A7C59", "#2E5AAC", "#8B2635"];
  const players: Player[] = playerNames.map((name, i) => ({
    id: `p${i}`,
    name,
    color: colors[i % colors.length],
    position: 0,
    history: [],
  }));

  const progress: Record<string, CellProgress[]> = {};
  players.forEach((p) => {
    progress[p.id] = [];
  });

  return {
    players,
    currentPlayerIndex: 0,
    dice: null,
    phase: "idle",
    winner: null,
    lastMove: null,
    progress,
    currentQuery: "",
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

/** Проверить, можно ли бросить кубик (прошло ли 24ч с посадки) */
export function canRoll(state: GameState): { allowed: boolean; waitSeconds: number } {
  const player = state.players[state.currentPlayerIndex];
  const cellId = player.position;
  if (cellId <= 1) return { allowed: true, waitSeconds: 0 };

  const playerProgress = state.progress[player.id] || [];
  const currentCellProgress = playerProgress.find((p) => p.cellId === cellId);

  if (!currentCellProgress) return { allowed: true, waitSeconds: 0 };

  const elapsed = Date.now() - currentCellProgress.landedAt;
  if (elapsed >= CELL_COOLDOWN_MS) {
    return { allowed: true, waitSeconds: 0 };
  }

  return { allowed: false, waitSeconds: Math.ceil((CELL_COOLDOWN_MS - elapsed) / 1000) };
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

  // Записываем прогресс посадки на клетку
  const newProgress = { ...state.progress };
  const playerProgress = [...(newProgress[player.id] || [])];
  playerProgress.push({
    cellId: finalPos,
    landedAt: Date.now(),
    completed: false,
  });
  newProgress[player.id] = playerProgress;

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
    progress: newProgress,
  };
}

/** Отметить клетку как выполненную */
export function completeCell(state: GameState, playerId: string, cellId: number, notes?: string): GameState {
  const newProgress = { ...state.progress };
  const playerProgress = [...(newProgress[playerId] || [])];
  const idx = playerProgress.findIndex((p) => p.cellId === cellId && !p.completed);
  if (idx !== -1) {
    playerProgress[idx] = {
      ...playerProgress[idx],
      completed: true,
      completedAt: Date.now(),
      notes,
    };
    newProgress[playerId] = playerProgress;
  }
  return { ...state, progress: newProgress };
}

/** Ускорить за Telegram Stars (сбросить таймер) */
export function accelerateWithStars(state: GameState, playerId: string, cellId: number): GameState {
  const newProgress = { ...state.progress };
  const playerProgress = [...(newProgress[playerId] || [])];
  const idx = playerProgress.findIndex((p) => p.cellId === cellId && !p.completed);
  if (idx !== -1) {
    playerProgress[idx] = {
      ...playerProgress[idx],
      landedAt: Date.now() - CELL_COOLDOWN_MS, // таймер истёк
    };
    newProgress[playerId] = playerProgress;
  }
  return { ...state, progress: newProgress };
}

/** Обновить запрос игрока */
export function updateQuery(state: GameState, query: string): GameState {
  return { ...state, currentQuery: query };
}

export function isSnake(cellId: number): boolean {
  return !!SNAKES[cellId];
}

export function isArrow(cellId: number): boolean {
  return !!ARROWS[cellId];
}

/** Форматировать секунды в чч:мм:сс */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
