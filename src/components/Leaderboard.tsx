import { motion } from "framer-motion";
import { Trophy, Clock, AlertTriangle, Sparkles, X } from "lucide-react";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/useGamePersistence";
import { formatTime, type Difficulty } from "@/lib/sudoku";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LeaderboardProps {
  onClose: () => void;
  currentDifficulty?: Difficulty;
}

const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"];

const difficultyColors: Record<Difficulty, string> = {
  easy: "text-success border-success",
  medium: "text-primary border-primary",
  hard: "text-warning border-warning",
  expert: "text-destructive border-destructive",
};

export function Leaderboard({ onClose, currentDifficulty }: LeaderboardProps) {
  const { getTopScores } = useLeaderboard();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty || "easy");

  const scores = getTopScores(selectedDifficulty, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-card rounded-2xl p-6 border border-primary/30 box-glow-primary"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-warning" />
          <h2 className="font-orbitron text-2xl text-glow-primary">LEADERBOARD</h2>
        </div>

        {/* Difficulty tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={cn(
                "px-4 py-2 rounded-lg font-orbitron text-sm uppercase whitespace-nowrap transition-all",
                "border",
                selectedDifficulty === diff
                  ? cn(difficultyColors[diff], "bg-current/10")
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Scores list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No scores yet for {selectedDifficulty} mode</p>
              <p className="text-sm mt-1">Complete a game to get on the leaderboard!</p>
            </div>
          ) : (
            scores.map((entry, index) => (
              <motion.div
                key={`${entry.date}-${index}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg",
                  "bg-secondary/50 border border-border",
                  index === 0 && "border-warning/50 bg-warning/10"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full font-orbitron font-bold text-sm",
                  index === 0 ? "bg-warning text-warning-foreground" :
                  index === 1 ? "bg-muted-foreground/30 text-foreground" :
                  index === 2 ? "bg-orange-600/30 text-orange-400" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {index + 1}
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-orbitron">{formatTime(entry.time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>{entry.mistakes}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>{entry.hintsUsed}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
