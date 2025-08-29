"use client";
import { useState, useEffect } from "react";

interface RoomJoinProps {
  roomId: string;
  setRoomId: (id: string) => void;
  onSelectPlayer: (player: "X" | "O") => void;
  joinRoom: () => void;
}

export default function RoomJoin({
  roomId,
  setRoomId,
  onSelectPlayer,
  joinRoom,
}: RoomJoinProps) {
  const [selected, setSelected] = useState<"X" | "O" | null>(null);

  useEffect(() => {
    if (selected) onSelectPlayer(selected);
  }, [selected, onSelectPlayer]);

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs space-y-4">
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Enter Room ID"
      />

      <div className="flex space-x-4">
        <button
          onClick={() => setSelected("X")}
          className={`px-4 py-2 rounded-lg font-bold transition ${
            selected === "X"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-800 hover:bg-indigo-100"
          }`}
        >
          Play X
        </button>
        <button
          onClick={() => setSelected("O")}
          className={`px-4 py-2 rounded-lg font-bold transition ${
            selected === "O"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-800 hover:bg-indigo-100"
          }`}
        >
          Play O
        </button>
      </div>

      <button
        onClick={joinRoom}
        className="w-full px-4 py-2 bg-indigo-700 text-white rounded-lg shadow hover:bg-indigo-800 transition disabled:opacity-50"
        disabled={!selected || !roomId}
      >
        Join Room
      </button>
    </div>
  );
}
