"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useHapticFeedback } from "@vkruglikov/react-telegram-web-app";
import Board from "./Board";
import Dice from "./Dice";
import { createInitialState, rollDice, computeMove, canRoll, completeCell, accelerateWithStars, updateQuery, formatDuration } from "@/lib/game";
import { CELLS } from "@/lib/cells";
import { Cell, GameState } from "@/types";

export default function Game() {
  const [state, setState] = useState<GameState>(() => createInitialState(["Игрок 1"]));
  const [rolling, setRolling] = useState(false);
  const [modalCell, setModalCell] = useState<Cell | null>(null);
  const [showQueryInput, setShowQueryInput] = useState(true);
  const [queryDraft, setQueryDraft] = useState("");
  const [timerText, setTimerText] = useState("");
  const [cellNotes, setCellNotes] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);

  const [impactOccurred, notificationOccurred] = useHapticFeedback();

  // Обновление таймера каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      const { allowed, waitSeconds } = canRoll(state);
      if (!allowed && waitSeconds > 0) {
        setTimerText(formatDuration(waitSeconds));
      } else {
        setTimerText("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const handleRoll = useCallback(() => {
    if (state.phase === "ended") return;
    const { allowed } = canRoll(state);
    if (!allowed) return;

    setRolling(true);
    impactOccurred("light");

    setTimeout(() => {
      const dice = rollDice();
      const newState = computeMove(state, dice);
      setState(newState);
      setRolling(false);

      if (newState.lastMove?.viaSnakeOrArrow) {
        impactOccurred("heavy");
      } else {
        impactOccurred("medium");
      }

      // Показать модалку клетки
      const landedCell = CELLS[newState.lastMove!.to - 1];
      if (landedCell) {
        setCellNotes("");
        setJustCompleted(false);
        setTimeout(() => setModalCell(landedCell), 400);
      }

      if (newState.winner) {
        notificationOccurred("success");
      }
    }, 800);
  }, [state, impactOccurred, notificationOccurred]);

  const handleCompleteCell = () => {
    if (!modalCell) return;
    const player = state.players[state.currentPlayerIndex];
    const newState = completeCell(state, player.id, modalCell.id, cellNotes);
    setState(newState);
    setJustCompleted(true);
    impactOccurred("medium");
  };

  const handleAccelerate = () => {
    if (!modalCell) return;
    const player = state.players[state.currentPlayerIndex];
    const newState = accelerateWithStars(state, player.id, modalCell.id);
    setState(newState);
    impactOccurred("heavy");
    // Здесь будет интеграция с Telegram Payments API
    alert("Здесь будет оплата Telegram Stars. Пока что таймер сброшен для теста.");
  };

  const handleStartGame = () => {
    if (!queryDraft.trim()) return;
    setState((prev) => updateQuery(prev, queryDraft.trim()));
    setShowQueryInput(false);
  };

  const currentPlayer = state.players[state.currentPlayerIndex];
  const { allowed: canRollNow } = canRoll(state);
  const isOnCell = currentPlayer.position >= 1 && currentPlayer.position <= 72;
  const currentCellProgress = isOnCell
    ? (state.progress[currentPlayer.id] || []).find((p) => p.cellId === currentPlayer.position && !p.completed)
    : undefined;
  const showTimer = isOnCell && !canRollNow && !rolling && state.phase !== "ended";

  // Экран ввода запроса
  if (showQueryInput) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 min-h-screen bg-kemp-dark text-white">
        <h1 className="text-2xl font-bold text-kemp-accent tracking-wider">ПОЛЕ КЭМП</h1>
        <div className="bg-kemp-panel border border-kemp-accent/20 rounded-2xl p-6 max-w-sm w-full">
          <p className="text-sm text-gray-300 mb-4">
            Перед входом на Поле задай себе вопрос. Что ты ищешь? Кого хочешь стать? Что нужно решить?
          </p>
          <p className="text-xs text-kemp-accent mb-4">
            Твой запрос — не просто мысль. Это намерение, за которое ты берёшь ответственность.
          </p>
          <textarea
            value={queryDraft}
            onChange={(e) => setQueryDraft(e.target.value)}
            placeholder="Мой запрос..."
            className="w-full bg-kemp-dark border border-white/10 rounded-lg p-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-kemp-accent"
          />
          <button
            onClick={handleStartGame}
            disabled={!queryDraft.trim()}
            className="mt-4 w-full py-3 rounded-lg bg-kemp-accent text-black font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
          >
            Войти на Поле
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen bg-kemp-dark text-white">
      <h1 className="text-xl font-bold text-kemp-accent tracking-wider">ПОЛЕ КЭМП</h1>

      {state.currentQuery && (
        <div className="bg-kemp-panel/50 border border-kemp-accent/20 rounded-lg px-4 py-2 max-w-sm w-full">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Запрос</p>
          <p className="text-sm text-white italic truncate">{state.currentQuery}</p>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: currentPlayer.color }} />
          <span>{currentPlayer.name}</span>
        </div>
        <span>•</span>
        <span>Клетка {currentPlayer.position}/72</span>
      </div>

      <Board players={state.players} onCellClick={(cell) => setModalCell(cell)} />

      {/* Таймер ожидания */}
      {showTimer && timerText && (
        <div className="bg-kemp-panel border border-kemp-red/30 rounded-xl p-4 max-w-sm w-full text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ты на клетке {currentPlayer.position}</p>
          <p className="text-lg font-mono font-bold text-kemp-red">{timerText}</p>
          <p className="text-xs text-gray-400 mt-1">до следующего броска</p>
          <button
            onClick={() => {
              const cell = CELLS[currentPlayer.position - 1];
              if (cell) setModalCell(cell);
            }}
            className="mt-2 text-xs text-kemp-accent underline"
          >
            Отметить состояние
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 mt-2">
        <Dice
          value={state.dice}
          rolling={rolling}
          onRoll={handleRoll}
          disabled={state.phase === "ended" || !canRollNow}
        />
        <p className="text-xs text-gray-500">
          {state.phase === "ended"
            ? `🏆 Победитель: ${state.players.find((p) => p.id === state.winner)?.name}`
            : rolling
            ? "Бросок..."
            : !canRollNow
            ? "Подожди 24ч или ускорь за Stars"
            : "Нажми, чтобы бросить кубик"}
        </p>
      </div>

      {/* Модалка клетки */}
      {modalCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalCell(null)}>
          <div className="bg-kemp-panel border border-kemp-accent/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-kemp-accent">{modalCell.name}</h2>
              <span className="text-xs px-2 py-1 rounded bg-white/10">{modalCell.id}/72</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">{modalCell.description}</p>
            {modalCell.task && (
              <div className="bg-kemp-dark rounded-lg p-3 border-l-2 border-kemp-accent mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Задание</p>
                <p className="text-sm text-white">{modalCell.task}</p>
              </div>
            )}
            {modalCell.reflection && (
              <div className="bg-kemp-dark rounded-lg p-3 border-l-2 border-kemp-red mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Спроси себя</p>
                <p className="text-sm text-white italic">{modalCell.reflection}</p>
              </div>
            )}

            {/* Форма отметки выполнения */}
            {currentPlayer.position === modalCell.id && !justCompleted && (
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Отметь состояние</p>
                <textarea
                  value={cellNotes}
                  onChange={(e) => setCellNotes(e.target.value)}
                  placeholder="Что почувствовал? Что заметил?"
                  className="w-full bg-kemp-dark border border-white/10 rounded-lg p-3 text-white text-sm resize-none h-20 focus:outline-none focus:border-kemp-accent mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCompleteCell}
                    className="flex-1 py-2 rounded-lg bg-kemp-accent text-black font-semibold text-sm hover:opacity-90 transition"
                  >
                    ✅ Выполнил задание
                  </button>
                </div>
              </div>
            )}

            {justCompleted && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 mt-3">
                <p className="text-sm text-green-400 text-center">Задание отмечено. Молодец.</p>
              </div>
            )}

            {/* Кнопка ускорить за Stars */}
            {currentPlayer.position === modalCell.id && !canRollNow && !justCompleted && (
              <button
                onClick={handleAccelerate}
                className="mt-3 w-full py-2 rounded-lg border border-kemp-accent text-kemp-accent font-semibold text-sm hover:bg-kemp-accent/10 transition"
              >
                ⚡ Ускорить за Telegram Stars
              </button>
            )}

            <button
              onClick={() => setModalCell(null)}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
