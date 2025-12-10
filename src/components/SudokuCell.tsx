import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Cell } from "@/lib/sudoku";

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  onClick: () => void;
  animationKey: string;
}

export function SudokuCell({
  cell,
  row,
  col,
  isSelected,
  isRelated,
  isSameNumber,
  onClick,
  animationKey,
}: SudokuCellProps) {
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative aspect-square w-full flex items-center justify-center",
        "text-xl sm:text-2xl md:text-3xl font-semibold font-rajdhani",
        "transition-all duration-200 ease-out",
        "border border-grid-line",
        isRightBorder && "border-r-2 border-r-grid-line-thick",
        isBottomBorder && "border-b-2 border-b-grid-line-thick",
        col === 0 && "border-l-2 border-l-grid-line-thick",
        row === 0 && "border-t-2 border-t-grid-line-thick",
        col === 8 && "border-r-2 border-r-grid-line-thick",
        row === 8 && "border-b-2 border-b-grid-line-thick",
        // Background states
        !isSelected && !isRelated && !isSameNumber && !cell.isError && "bg-card hover:bg-cell-highlight",
        isRelated && !isSelected && !cell.isError && "bg-cell-highlight",
        isSameNumber && !isSelected && !cell.isError && "bg-cell-same-number",
        isSelected && !cell.isError && "bg-primary/20 box-glow-primary",
        cell.isError && "bg-cell-error",
        // Text colors
        cell.isPreset ? "text-cell-preset" : "text-primary",
        cell.isError && "text-destructive"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {cell.value ? (
        <motion.span
          key={animationKey}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            ...(cell.isError && {
              x: [0, -4, 4, -4, 4, 0],
            })
          }}
          transition={{ 
            duration: cell.isError ? 0.5 : 0.2,
            ease: cell.isError ? "easeInOut" : [0.34, 1.56, 0.64, 1]
          }}
          className={cn(
            cell.isHighlighted && "animate-cell-glow"
          )}
        >
          {cell.value}
        </motion.span>
      ) : cell.notes.length > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 sm:p-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={cn(
                "text-[8px] sm:text-[10px] md:text-xs flex items-center justify-center",
                cell.notes.includes(n) ? "text-muted-foreground" : "text-transparent"
              )}
            >
              {n}
            </span>
          ))}
        </div>
      ) : null}
      
      {/* Hint animation overlay */}
      {cell.isHighlighted && !cell.value && (
        <motion.div
          className="absolute inset-0 animate-hint-pulse rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );
}
