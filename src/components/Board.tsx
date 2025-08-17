"use client";
import Cell from "./Cell";

type Props = {
  board: (null | "X" | "O")[];
  onCellClick: (index: number) => void;
};

export default function Board({ board, onCellClick }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {board.map((value, index) => (
        <Cell key={index} value={value} onClick={() => onCellClick(index)} />
      ))}
    </div>
  );
}
