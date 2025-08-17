"use client";

import { useEffect, useState } from "react";
import Board from "@/components/Board";
import RoomJoin from "@/components/RoomJoin";
import { calculateWinner } from "@/utils/game";
import { getSocket } from "@/lib/socket";

export default function TicTacToePage() {
  const [board, setBoard] = useState<(null | "X" | "O")[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const socket = getSocket();

  useEffect(() => {
    socket.on("assignSymbol", (symbol: "X" | "O") => setPlayerSymbol(symbol));

    socket.on("boardUpdated", ({ board, isXNext }) => {
      setBoard(board);
      setIsXNext(isXNext);
      setWinner(calculateWinner(board));
    });

    socket.on("gameRestarted", () => {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setWinner(null);
    });

    socket.on("receiveMessage", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("assignSymbol");
      socket.off("boardUpdated");
      socket.off("gameRestarted");
      socket.off("receiveMessage");
    };
  }, [socket]);

  const joinRoom = () => {
    if (!roomId) return;
    socket.emit("joinRoom", roomId);
    setHasJoinedRoom(true);
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    if ((isXNext && playerSymbol !== "X") || (!isXNext && playerSymbol !== "O"))
      return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    const nextPlayer = !isXNext;

    setBoard(newBoard);
    setIsXNext(nextPlayer);
    setWinner(calculateWinner(newBoard));

    socket.emit("updateBoard", {
      roomId,
      board: newBoard,
      isXNext: nextPlayer,
    });
  };

  const restartGame = () => {
    socket.emit("restartGame", roomId);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    setMessages((prev) => [...prev, `You: ${messageInput}`]);
    socket.emit("sendMessage", {
      roomId,
      message: `Opponent: ${messageInput}`,
    });
    setMessageInput("");
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-100">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
          Tic Tac Toe Multiplayer
        </h1>

        {!hasJoinedRoom && (
          <RoomJoin roomId={roomId} setRoomId={setRoomId} joinRoom={joinRoom} />
        )}

        {hasJoinedRoom && (
          <>
            <p className="mb-4 text-gray-700 text-center">
              You are playing as {playerSymbol}
            </p>
            <Board board={board} onCellClick={handleClick} />
            <h2 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-700 text-center">
              {winner
                ? `Winner: ${winner}`
                : `Next Player: ${isXNext ? "X" : "O"}`}
            </h2>
            <button
              onClick={restartGame}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Restart Game
            </button>
          </>
        )}
      </div>

      {/* Sidebar Chat */}
      {hasJoinedRoom && (
        <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-gray-300 bg-white p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-black text-center sm:text-left">
            Room Chat
          </h2>
          <div className="flex-1 overflow-y-auto mb-2 space-y-1">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-2 rounded bg-gray-100 text-black">
                {msg}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-2 py-2 border rounded text-black"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Winner/Loser Modal */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              🎉 {winner === playerSymbol ? "You Win!" : "You Lose!"} 🎉
            </h2>
            <button
              onClick={restartGame}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
