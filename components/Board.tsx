"use client";

import React, { useState, useCallback } from "react";
import { Cell as CellType } from "@/types";
import { CELLS, LEVEL_COLORS } from "@/lib/cells";
import { getCellCoords, BOARD_COLS, BOARD_ROWS } from "@/lib/game";

interface BoardProps {
  players: { id: string; name: string; color: string; position: number }[];
  onCellClick?: (cell: CellType) => void;
}

const CELL_SIZE = 44;
const GAP = 2;
const WIDTH = BOARD_COLS * (CELL_SIZE + GAP) + GAP;
const HEIGHT = BOARD_ROWS * (CELL_SIZE + GAP) + GAP;

export default function Board({ players, onCellClick }: BoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const handleCellClick = useCallback(
    (cellId: number) => {
      const cell = CELLS[cellId - 1];
      if (cell && onCellClick) onCellClick(cell);
    },
    [onCellClick]
  );

  return (
    <div className="relative select-none">
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="rounded-xl bg-kemp-panel shadow-2xl"
      >
        {/* Cells */}
        {CELLS.map((cell) => {
          const coords = getCellCoords(cell.id);
          if (!coords) return null;
          const x = GAP + coords.col * (CELL_SIZE + GAP);
          const y = GAP + coords.row * (CELL_SIZE + GAP);
          const isHovered = hoveredCell === cell.id;

          return (
            <g key={cell.id} onClick={() => handleCellClick(cell.id)}>
              <rect
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={6}
                fill={LEVEL_COLORS[cell.level]}
                stroke={isHovered ? "#fff" : "transparent"}
                strokeWidth={2}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredCell(cell.id)}
                onMouseLeave={() => setHoveredCell(null)}
                opacity={cell.type === "snake" ? 0.75 : cell.type === "arrow" ? 0.95 : 0.85}
              />
              <text
                x={x + CELL_SIZE / 2}
                y={y + CELL_SIZE / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize={cell.id >= 10 ? 10 : 12}
                fontWeight={600}
                pointerEvents="none"
              >
                {cell.id}
              </text>
              {cell.type === "snake" && (
                <text x={x + CELL_SIZE / 2} y={y + CELL_SIZE - 4} textAnchor="middle" fill="white" fontSize={8} pointerEvents="none">
                  ↓
                </text>
              )}
              {cell.type === "arrow" && (
                <text x={x + CELL_SIZE / 2} y={y + CELL_SIZE - 4} textAnchor="middle" fill="white" fontSize={8} pointerEvents="none">
                  ↑
                </text>
              )}
            </g>
          );
        })}

        {/* Snakes and arrows lines */}
        {CELLS.filter((c) => c.jumpTo).map((cell) => {
          const from = getCellCoords(cell.id);
          const to = getCellCoords(cell.jumpTo!);
          if (!from || !to) return null;
          const x1 = GAP + from.col * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          const y1 = GAP + from.row * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          const x2 = GAP + to.col * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          const y2 = GAP + to.row * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          const isSnake = cell.type === "snake";

          return (
            <line
              key={`line-${cell.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isSnake ? "#ff4444" : "#44ff88"}
              strokeWidth={1.5}
              strokeDasharray={isSnake ? "4 2" : undefined}
              opacity={0.6}
              pointerEvents="none"
            />
          );
        })}

        {/* Players */}
        {players.map((player, idx) => {
          if (player.position === 0) return null;
          const coords = getCellCoords(player.position);
          if (!coords) return null;
          const offset = (idx - (players.length - 1) / 2) * 10;
          const cx = GAP + coords.col * (CELL_SIZE + GAP) + CELL_SIZE / 2 + offset;
          const cy = GAP + coords.row * (CELL_SIZE + GAP) + CELL_SIZE / 2;
          return (
            <circle
              key={player.id}
              cx={cx}
              cy={cy}
              r={10}
              fill={player.color}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          );
        })}
      </svg>
    </div>
  );
}
