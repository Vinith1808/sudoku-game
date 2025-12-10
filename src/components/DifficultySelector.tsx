import { motion } from "framer-motion";
import { Zap, Target, Flame, Skull } from "lucide-react";
import type { Difficulty } from "@/lib/sudoku";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
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

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
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

      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-bold text-glow-primary mb-4">
          SUDOKU
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-rajdhani">
          Next-Gen Puzzle Experience
        </p>
      </motion.div>

      {/* Difficulty cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full relative z-10">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.level}
            onClick={() => onSelect(diff.level)}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
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
    </motion.div>
  );
}
