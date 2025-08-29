"use client";

import { useState } from "react";

interface RoomJoinProps {
  roomId: string;
  setRoomId: (value: string) => void;
  joinRoom: () => void; // old functionality stays
  onSelectPlayer?: (player: "X" | "O") => void; // new callback
}

export default function RoomJoin({
  roomId,
  setRoomId,
  joinRoom,
  onSelectPlayer,
}: RoomJoinProps) {
  const [player, setPlayer] = useState<"X" | "O" | null>(null);

  const handleSelect = (choice: "X" | "O") => {
    setPlayer(choice);
    if (onSelectPlayer) {
      onSelectPlayer(choice); // send selection back to parent
    }
  };

  return (
    <div className="flex gap-2 mb-4 items-center">
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="px-2 py-1 border rounded text-black"
        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
      />

      {/* X / O Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSelect("X")}
          className={`px-4 py-1 rounded ${
            player === "X"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          X
        </button>
        <button
          onClick={() => handleSelect("O")}
          className={`px-4 py-1 rounded ${
            player === "O"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          O
        </button>
      </div>

      <button
        onClick={joinRoom}
        className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Join Room
      </button>
    </div>
  );
}
