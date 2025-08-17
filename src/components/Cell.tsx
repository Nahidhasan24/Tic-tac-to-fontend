"use client";
import { X, Circle } from "lucide-react";

type Props = {
  value: "X" | "O" | null;
  onClick: () => void;
};

export default function Cell({ value, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-24 h-24 bg-white shadow-md flex items-center justify-center rounded-lg hover:bg-gray-50"
    >
      {value === "X" && <X className="w-12 h-12 text-red-500" />}
      {value === "O" && <Circle className="w-12 h-12 text-blue-500" />}
    </button>
  );
}
