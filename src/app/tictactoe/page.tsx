"use client";

import { useEffect, useState, useRef } from "react";
import Board from "@/components/Board";
import RoomJoin from "@/components/RoomJoin";
import { calculateWinner } from "@/utils/game";
import { getSocket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";

export default function TicTacToePage() {
  const [board, setBoard] = useState<(null | "X" | "O")[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // Socket event listeners
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
      scrollToBottom();
    });
    socket.on("playerJoined", (data) => {
      setMessages((prev) => [...prev, `System: ${data}`]);
      scrollToBottom();
    });

    return () => {
      socket.off("assignSymbol");
      socket.off("boardUpdated");
      socket.off("gameRestarted");
      socket.off("receiveMessage");
      socket.off("playerJoined");
    };
  }, [socket]);

  // Update stats
  useEffect(() => {
    if (winner) {
      if (winner === playerSymbol)
        setStats((prev) => ({ ...prev, wins: prev.wins + 1 }));
      else if (winner !== "Draw")
        setStats((prev) => ({ ...prev, losses: prev.losses + 1 }));
    } else if (!winner && board.every((cell) => cell !== null)) {
      setStats((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [winner, board, playerSymbol]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    if (!winner) return; // Prevent restart while game running
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
    scrollToBottom();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 transition-all duration-500">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 text-indigo-800 text-center drop-shadow-md"
        >
          Tic Tac Toe Multiplayer
        </motion.h1>

        {!hasJoinedRoom && (
          <RoomJoin
            roomId={roomId}
            setRoomId={setRoomId}
            onSelectPlayer={(player) => setPlayerSymbol(player)}
            joinRoom={joinRoom}
          />
        )}

        {hasJoinedRoom && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full"
          >
            <p className="mb-2 text-gray-700 text-lg text-center">
              You are <span className="font-bold">{playerSymbol}</span> | Room:{" "}
              <span className="font-mono font-semibold">{roomId}</span>
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-2 text-gray-700 text-lg">
              <p>
                Wins: <span className="font-bold">{stats.wins}</span>
              </p>
              <p>
                Losses: <span className="font-bold">{stats.losses}</span>
              </p>
              <p>
                Draws: <span className="font-bold">{stats.draws}</span>
              </p>
            </div>

            {/* Board */}
            <div className="w-full max-w-xs md:max-w-sm mt-4">
              <Board board={board} onCellClick={handleClick} />
            </div>

            <h2 className="mt-6 text-lg md:text-xl font-semibold text-gray-700 text-center">
              {winner
                ? `Winner: ${winner}`
                : board.every((cell) => cell !== null)
                ? "Draw"
                : `Next Player: ${isXNext ? "X" : "O"}`}
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              disabled={!winner}
              className={`mt-4 px-6 py-2 rounded-xl shadow-lg transition
                ${
                  !winner
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
            >
              Restart Game
            </motion.button>

            {/* Toggle Chat Button (Mobile) */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-xl md:hidden hover:bg-indigo-700 transition z-50"
            >
              💬
            </button>
          </motion.div>
        )}
      </div>

      {/* Chat Sidebar (Desktop) */}
      {hasJoinedRoom && (
        <div className="hidden md:flex md:flex-col md:w-80 md:relative md:shadow-none p-4 bg-white border-l border-gray-300">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-700 text-left">
            Room Chat
          </h2>
          <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 bg-indigo-50 rounded-lg shadow-inner">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg break-words max-w-xs ${
                  msg.startsWith("You")
                    ? "bg-indigo-100 text-indigo-900 self-end"
                    : msg.startsWith("System")
                    ? "bg-gray-200 text-gray-700 self-center"
                    : "bg-indigo-200 text-indigo-900 self-start"
                }`}
              >
                {msg}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex flex-col mt-2 gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 w-full"
              placeholder="Type a message..."
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition w-full"
            >
              Send
            </motion.button>
          </div>
        </div>
      )}

      {/* Chat Sidebar (Mobile) */}
      <AnimatePresence>
        {hasJoinedRoom && chatOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-80 max-w-xs bg-white border-l border-gray-300 p-4 shadow-2xl z-40 md:hidden flex flex-col"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-700 text-left">
              Room Chat
            </h2>
            <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 bg-indigo-50 rounded-lg shadow-inner">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg break-words max-w-xs ${
                    msg.startsWith("You")
                      ? "bg-indigo-100 text-indigo-900 self-end"
                      : msg.startsWith("System")
                      ? "bg-gray-200 text-gray-700 self-center"
                      : "bg-indigo-200 text-indigo-900 self-start"
                  }`}
                >
                  {msg}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex flex-col mt-2 gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 w-full"
                placeholder="Type a message..."
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition w-full"
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl text-center w-full max-w-xs md:max-w-sm"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-600 animate-pulse">
                🎉 {winner === playerSymbol ? "You Win!" : "You Lose!"} 🎉
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition"
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
