import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Flame, Skull, Trophy, Settings, Moon, Sun, RotateCcw } from "lucide-react";
import type { Difficulty } from "@/lib/sudoku";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Leaderboard } from "./Leaderboard";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  hasSavedGame: boolean;
  savedGameDifficulty?: Difficulty;
  onContinue: () => void;
}

const difficulties: { level: Difficulty; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  { 
    level: "easy", 
    label: "Easy", 
    icon: <Zap className="w-8 h-8" />, 
    description: "Perfect for beginners",
    color: "text-success hover:box-glow-success hover:border-success"
  },
  { 
    level: "medium", 
    label: "Medium", 
    icon: <Target className="w-8 h-8" />, 
    description: "A balanced challenge",
    color: "text-primary hover:box-glow-primary hover:border-primary"
  },
  { 
    level: "hard", 
    label: "Hard", 
    icon: <Flame className="w-8 h-8" />, 
    description: "For seasoned players",
    color: "text-warning hover:box-glow-accent hover:border-warning"
  },
  { 
    level: "expert", 
    label: "Expert", 
    icon: <Skull className="w-8 h-8" />, 
    description: "Ultimate brain teaser",
    color: "text-destructive hover:box-glow-error hover:border-destructive"
  },
];

export function DifficultySelector({ onSelect, hasSavedGame, savedGameDifficulty, onContinue }: DifficultySelectorProps) {
  const { theme, toggleTheme } = useTheme();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <motion.div
        className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLeaderboard(true)}
          className="p-3 rounded-lg bg-card border border-border text-foreground hover:text-primary transition-colors"
          title="Leaderboard"
        >
          <Trophy className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-3 rounded-lg bg-card border border-border text-foreground hover:text-primary transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-bold text-glow-primary mb-4">
          SUDOKU
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-rajdhani">
          Next-Gen Puzzle Experience
        </p>
      </motion.div>

      {/* Continue button if saved game exists */}
      {hasSavedGame && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6 relative z-10"
        >
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-orbitron font-bold box-glow-primary"
          >
            <RotateCcw className="w-5 h-5" />
            Continue {savedGameDifficulty && `(${savedGameDifficulty})`}
          </motion.button>
          <p className="text-center text-sm text-muted-foreground mt-2">
            or start a new game below
          </p>
        </motion.div>
      )}

      {/* Difficulty cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full relative z-10">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.level}
            onClick={() => onSelect(diff.level)}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index + (hasSavedGame ? 0.3 : 0) }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex flex-col items-center p-6 rounded-xl",
              "bg-card border-2 border-border",
              "transition-all duration-300",
              diff.color
            )}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            >
              {diff.icon}
            </motion.div>
            <h3 className="font-orbitron text-lg mt-4 mb-2">{diff.label}</h3>
            <p className="text-xs text-muted-foreground text-center font-rajdhani">
              {diff.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Leaderboard modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
