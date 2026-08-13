"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useMainButton, useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import Board from "./Board";
import Dice from "./Dice";
import { createInitialState, rollDice, computeMove } from "@/lib/game";
import { CELLS } from "@/lib/cells";
import { Cell, GameState } from "@/types";

export default function Game() {
  const [state, setState] = useState<GameState>(() => createInitialState(["Игрок 1"]));
  const [rolling, setRolling] = useState(false);
  const [modalCell, setModalCell] = useState<Cell | null>(null);

  const [showMainButton, hideMainButton] = useMainButton();
  const [impact] = useHapticFeedback();

  useEffect(() => {
    showMainButton({ text: "Новая игра" });
    return () => hideMainButton();
  }, [showMainButton, hideMainButton]);

  const handleRoll = useCallback(() => {
    if (state.phase === "ended") return;
    setRolling(true);
    impact("light");

    setTimeout(() => {
      const dice = rollDice();
      const newState = computeMove(state, dice);
      setState(newState);
      setRolling(false);

      if (newState.lastMove?.viaSnakeOrArrow) {
        impact("heavy");
      } else {
        impact("medium");
      }

      // Показать модалку клетки
      const landedCell = CELLS[newState.lastMove!.to - 1];
      if (landedCell) {
        setTimeout(() => setModalCell(landedCell), 400);
      }

      if (newState.winner) {
        impact("notification", "success");
      }
    }, 800);
  }, [state, impact]);

  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen bg-kemp-dark text-white">
      <h1 className="text-xl font-bold text-kemp-accent tracking-wider">КЭМП — ЛИЛА</h1>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: currentPlayer.color }} />
          <span>{currentPlayer.name}</span>
        </div>
        <span>•</span>
        <span>Клетка {currentPlayer.position}/72</span>
      </div>

      <Board players={state.players} onCellClick={(cell) => setModalCell(cell)} />

      <div className="flex flex-col items-center gap-2 mt-2">
        <Dice
          value={state.dice}
          rolling={rolling}
          onRoll={handleRoll}
          disabled={state.phase === "ended"}
        />
        <p className="text-xs text-gray-500">
          {state.phase === "ended"
            ? `🏆 Победитель: ${state.players.find((p) => p.id === state.winner)?.name}`
            : rolling
            ? "Бросок..."
            : "Нажми, чтобы бросить кубик"}
        </p>
      </div>

      {/* Модалка клетки */}
      {modalCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalCell(null)}>
          <div className="bg-kemp-panel border border-kemp-accent/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-kemp-accent">{modalCell.name}</h2>
              <span className="text-xs px-2 py-1 rounded bg-white/10">{modalCell.id}/72</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{modalCell.description}</p>
            {modalCell.task && (
              <div className="bg-kemp-dark rounded-lg p-3 border-l-2 border-kemp-accent">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Задание</p>
                <p className="text-sm text-white">{modalCell.task}</p>
              </div>
            )}
            <button
              onClick={() => setModalCell(null)}
              className="mt-4 w-full py-2 rounded-lg bg-kemp-accent text-black font-semibold text-sm hover:opacity-90 transition"
            >
              Продолжить путь
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
