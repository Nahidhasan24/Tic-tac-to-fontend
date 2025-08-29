"use client";

interface StatsPanelProps {
  winStreak: number;
  gamesPlayed: number;
  lastGameResult: string | null;
}

export default function StatsPanel({
  winStreak,
  gamesPlayed,
  lastGameResult,
}: StatsPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-50 bg-white p-3 rounded-xl shadow-lg flex flex-col space-y-2 w-48 md:w-64">
      <h3 className="text-lg font-bold text-indigo-700 text-center md:text-left">
        Player Stats
      </h3>
      <p>
        Win Streak: <span className="font-bold">{winStreak}</span>
      </p>
      <p>
        Games Played: <span className="font-bold">{gamesPlayed}</span>
      </p>
      <p>
        Last Game: <span className="font-bold">{lastGameResult ?? "-"}</span>
      </p>
      <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition">
        Quick Match ⚡
      </button>
      <button className="mt-1 px-3 py-1 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition">
        Challenge Friend 🏆
      </button>
    </div>
  );
}
