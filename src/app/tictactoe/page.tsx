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

    socket.on("playerJoined", (data) => {
      alert(data);
    });

    return () => {
      socket.off("assignSymbol");
      socket.off("boardUpdated");
      socket.off("gameRestarted");
      socket.off("receiveMessage");
      socket.off("playerJoined");
    };
  }, [socket]);

  const joinRoom = () => {
    if (!roomId) return;
    socket.emit("joinRoom", roomId, playerSymbol);
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

  const opponentSymbol = playerSymbol === "X" ? "O" : "X";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          Tic Tac Toe Multiplayer
        </h1>

        {!hasJoinedRoom && (
          <RoomJoin
            roomId={roomId}
            setRoomId={setRoomId}
            onSelectPlayer={(player) => {
              setPlayerSymbol(player);
            }}
            joinRoom={joinRoom}
          />
        )}

        {hasJoinedRoom && (
          <>
            <p className="mb-4 text-gray-700">
              You are playing as {playerSymbol}
              <h3 className="b">Room Id : {roomId}</h3>
            </p>
            <Board board={board} onCellClick={handleClick} />
            <h2 className="mt-6 text-xl font-semibold text-gray-700">
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
      {hasJoinedRoom ? (
        <div className="w-60 sm:w-1/4 md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-md border-l border-gray-300 bg-white p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-black">Room Chat</h2>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-2 space-y-1">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-1 rounded bg-gray-100 text-black">
                {msg}
              </div>
            ))}
          </div>

          {/* Input + Button */}
          <div className="flex-row m-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-2 py-1 border rounded text-black"
              placeholder="Type a message..."
            />

            <button
              onClick={sendMessage}
              className="px-4 py-1 mt-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
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
