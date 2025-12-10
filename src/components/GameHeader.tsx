import { motion } from "framer-motion";
import { Timer, AlertTriangle, Sparkles } from "lucide-react";
import { formatTime, type Difficulty } from "@/lib/sudoku";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  difficulty: Difficulty;
  elapsedTime: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-success",
  medium: "text-primary",
  hard: "text-warning",
  expert: "text-destructive",
};

const difficultyGlow: Record<Difficulty, string> = {
  easy: "box-glow-success",
  medium: "box-glow-primary",
  hard: "box-glow-accent",
  expert: "box-glow-error",
};

export function GameHeader({ difficulty, elapsedTime, mistakes, maxMistakes, hintsUsed }: GameHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[500px] mx-auto mb-6"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Difficulty badge */}
        <div
          className={cn(
            "px-4 py-2 rounded-full border border-current/30 font-orbitron text-sm uppercase tracking-wider",
            difficultyColors[difficulty],
            difficultyGlow[difficulty]
          )}
        >
          {difficulty}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Timer */}
          <div className="flex items-center gap-2 text-foreground">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-orbitron text-lg tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Mistakes */}
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "w-5 h-5",
              mistakes >= maxMistakes - 1 ? "text-destructive" : "text-warning"
            )} />
            <span className={cn(
              "font-orbitron text-lg",
              mistakes >= maxMistakes - 1 ? "text-destructive" : "text-foreground"
            )}>
              {mistakes}/{maxMistakes}
            </span>
          </div>

          {/* Hints */}
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-warning" />
            <span className="font-orbitron text-lg">{hintsUsed}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
