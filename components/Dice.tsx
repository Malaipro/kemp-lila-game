"use client";

import React from "react";

interface DiceProps {
  value: number | null;
  rolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

export default function Dice({ value, rolling, onRoll, disabled }: DiceProps) {
  const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <button
      onClick={onRoll}
      disabled={disabled || rolling}
      className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg transition-all active:scale-95
        ${rolling ? "animate-pulse bg-kemp-yellow text-black" : "bg-kemp-panel text-kemp-accent border border-kemp-accent/30 hover:border-kemp-accent"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {rolling ? "?" : value ? faces[value - 1] : "🎲"}
    </button>
  );
}
