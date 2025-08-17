"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800 mb-8">
        Welcome to Tic Tac Toe Multiplayer
      </h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
        Play real-time Tic Tac Toe with friends. Enter a room ID and challenge
        your friends!
      </p>
      <Link href="/tictactoe">
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          Play Now
        </button>
      </Link>
    </div>
  );
}
