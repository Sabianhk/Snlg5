"use client";

import clsx from "clsx";

export type PlayerState = { userId: string; position: number; color: string };

function toSerpentineIndex(i: number): number {
  // i from 0..99 -> square number 1..100 serpentine
  const row = Math.floor(i / 10);
  const col = i % 10;
  const leftToRight = row % 2 === 0;
  const base = row * 10;
  const idx = leftToRight ? base + col : base + (9 - col);
  return idx + 1;
}

export default function Board({ players = [] as PlayerState[] }: { players?: PlayerState[] }) {
  const tokenAt = (square: number) => players.filter((p) => p.position === square);

  return (
    <div className="grid grid-cols-10 gap-1 w-[620px] max-w-full">
      {Array.from({ length: 100 }).map((_, i) => {
        const square = toSerpentineIndex(99 - i);
        const tokens = tokenAt(square);
        return (
          <div
            key={i}
            className={clsx(
              "relative aspect-square rounded-md border border-slate-700",
              square % 2 === 0 ? "bg-slate-800" : "bg-slate-900"
            )}
          >
            <span className="absolute top-1 left-1 text-xs text-slate-400">{square}</span>
            <div className="absolute inset-0 flex items-end justify-end p-1 gap-1 flex-wrap">
              {tokens.map((t) => (
                <span
                  key={t.userId}
                  className="w-3 h-3 rounded-full border border-white/30"
                  style={{ backgroundColor: t.color }}
                  title={t.userId}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}