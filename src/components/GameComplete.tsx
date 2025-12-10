import { motion } from "framer-motion";
import { Trophy, Clock, AlertTriangle, Sparkles, RotateCcw } from "lucide-react";
import { formatTime, type Difficulty } from "@/lib/sudoku";

interface GameCompleteProps {
  difficulty: Difficulty;
  time: number;
  mistakes: number;
  hintsUsed: number;
  onNewGame: () => void;
  isWin: boolean;
}

export function GameComplete({ difficulty, time, mistakes, hintsUsed, onNewGame, isWin }: GameCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative max-w-md w-full bg-card rounded-2xl p-8 border-2 border-primary/30 box-glow-primary"
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {isWin && [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: "50%",
                y: "50%",
                opacity: 0,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
          >
            {isWin ? (
              <Trophy className="w-10 h-10 text-primary" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-destructive" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`font-orbitron text-3xl font-bold mb-2 ${
              isWin ? "text-glow-primary" : "text-destructive"
            }`}
          >
            {isWin ? "VICTORY!" : "GAME OVER"}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8 font-rajdhani text-lg"
          >
            {isWin
              ? `You conquered ${difficulty} mode!`
              : "Too many mistakes. Try again!"}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-secondary/50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <span className="font-orbitron text-lg">{formatTime(time)}</span>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-2" />
              <span className="font-orbitron text-lg">{mistakes}</span>
              <p className="text-xs text-muted-foreground">Mistakes</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
              <span className="font-orbitron text-lg">{hintsUsed}</span>
              <p className="text-xs text-muted-foreground">Hints</p>
            </div>
          </motion.div>

          {/* Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onNewGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-orbitron font-bold hover:box-glow-primary transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
