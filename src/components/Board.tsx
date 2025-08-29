"use client";

import { motion } from "framer-motion";

interface BoardProps {
  board: (null | "X" | "O")[];
  onCellClick: (index: number) => void;
}

export default function Board({ board, onCellClick }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full aspect-square max-w-xs md:max-w-sm">
      {board.map((cell, idx) => (
        <motion.div
          key={idx}
          onClick={() => onCellClick(idx)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center bg-white rounded-lg shadow-md text-4xl md:text-5xl text-indigo-700 font-bold cursor-pointer aspect-square"
        >
          {cell}
        </motion.div>
      ))}
    </div>
  );
}
