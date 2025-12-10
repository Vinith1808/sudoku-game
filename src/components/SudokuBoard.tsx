import { motion } from "framer-motion";
import { SudokuCell } from "./SudokuCell";
import type { Board } from "@/lib/sudoku";
import { getRelatedCells } from "@/lib/sudoku";

interface SudokuBoardProps {
  board: Board;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  cellAnimationKeys: string[][];
}

export function SudokuBoard({ board, selectedCell, onCellClick, cellAnimationKeys }: SudokuBoardProps) {
  const relatedCells = selectedCell ? getRelatedCells(selectedCell.row, selectedCell.col) : [];
  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col].value : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[500px] mx-auto"
    >
      <div className="relative p-1 sm:p-2 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 box-glow-primary">
        <div className="absolute inset-0 rounded-xl bg-grid-pattern opacity-20" />
        <div className="relative grid grid-cols-9 gap-0 bg-card rounded-lg overflow-hidden">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const isRelated = relatedCells.some(c => c.row === rowIndex && c.col === colIndex);
              const isSameNumber = selectedValue !== null && cell.value === selectedValue && !isSelected;

              return (
                <SudokuCell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  isSelected={isSelected}
                  isRelated={isRelated}
                  isSameNumber={isSameNumber}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  animationKey={cellAnimationKeys[rowIndex][colIndex]}
                />
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
