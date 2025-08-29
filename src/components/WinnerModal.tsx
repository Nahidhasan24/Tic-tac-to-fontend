"use client";
import { motion, AnimatePresence } from "framer-motion";

interface WinnerModalProps {
  winner: string | null;
  playerSymbol: string;
  restartGame: () => void;
}

export default function WinnerModal({
  winner,
  playerSymbol,
  restartGame,
}: WinnerModalProps) {
  return (
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
            <button
              onClick={restartGame}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition"
            >
              Play Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
