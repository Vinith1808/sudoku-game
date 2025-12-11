import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Flame, Skull, Trophy, Moon, Sun, RotateCcw, Users, Calendar, Award } from "lucide-react";
import type { Difficulty } from "@/lib/sudoku";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Leaderboard } from "./Leaderboard";
import DailyChallenge from "./DailyChallenge";
import Achievements from "./Achievements";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useAchievements } from "@/hooks/useAchievements";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  hasSavedGame: boolean;
  savedGameDifficulty?: Difficulty;
  onContinue: () => void;
  onMultiplayer: (difficulty: Difficulty) => void;
  onDailyChallenge: () => void;
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

export function DifficultySelector({ 
  onSelect, 
  hasSavedGame, 
  savedGameDifficulty, 
  onContinue, 
  onMultiplayer,
  onDailyChallenge 
}: DifficultySelectorProps) {
  const { theme, toggleTheme } = useTheme();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMultiplayerSelect, setShowMultiplayerSelect] = useState(false);
  
  const { dailyChallenge, dailyStats } = useDailyChallenge();
  const { achievements } = useAchievements();

  const handleDailyPlay = () => {
    setShowDailyChallenge(false);
    onDailyChallenge();
  };

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
          onClick={() => setShowAchievements(true)}
          className="p-3 rounded-lg bg-card border border-border text-foreground hover:text-primary transition-colors relative"
          title="Achievements"
        >
          <Award className="w-5 h-5" />
          {achievements.filter(a => a.unlockedAt).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
              {achievements.filter(a => a.unlockedAt).length}
            </span>
          )}
        </motion.button>

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

      {/* Special game modes */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-3 mb-6 relative z-10"
      >
        <motion.button
          onClick={() => setShowDailyChallenge(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 font-rajdhani font-semibold hover:from-orange-500/30 hover:to-red-500/30 transition-all"
        >
          <Calendar className="w-5 h-5" />
          Daily Challenge
          {dailyStats.currentStreak > 0 && (
            <span className="text-xs bg-orange-500/30 px-2 py-0.5 rounded-full">
              🔥 {dailyStats.currentStreak}
            </span>
          )}
        </motion.button>

        <motion.button
          onClick={() => setShowMultiplayerSelect(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 font-rajdhani font-semibold hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
        >
          <Users className="w-5 h-5" />
          Multiplayer
        </motion.button>
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

      {/* Multiplayer difficulty selection */}
      <AnimatePresence>
        {showMultiplayerSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMultiplayerSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-display font-bold text-foreground">Select Difficulty</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {difficulties.map((diff) => (
                  <motion.button
                    key={diff.level}
                    onClick={() => {
                      setShowMultiplayerSelect(false);
                      onMultiplayer(diff.level);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl",
                      "bg-secondary border border-border",
                      "transition-all duration-200",
                      diff.color
                    )}
                  >
                    {diff.icon}
                    <span className="font-orbitron mt-2">{diff.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </AnimatePresence>

      {/* Daily Challenge modal */}
      <AnimatePresence>
        {showDailyChallenge && (
          <DailyChallenge
            dailyChallenge={dailyChallenge}
            dailyStats={dailyStats}
            onPlay={handleDailyPlay}
            onClose={() => setShowDailyChallenge(false)}
          />
        )}
      </AnimatePresence>

      {/* Achievements modal */}
      <AnimatePresence>
        {showAchievements && (
          <Achievements
            achievements={achievements}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
