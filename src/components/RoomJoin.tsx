"use client";

interface RoomJoinProps {
  roomId: string;
  setRoomId: (value: string) => void;
  joinRoom: () => void;
}

export default function RoomJoin({
  roomId,
  setRoomId,
  joinRoom,
}: RoomJoinProps) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="px-2 py-1 border rounded text-black"
        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
      />
      <button
        onClick={joinRoom}
        className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Join Room
      </button>
    </div>
  );
}
