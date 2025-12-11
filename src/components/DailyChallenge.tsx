import { motion } from 'framer-motion';
import { X, Calendar, Flame, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/sudoku';
import type { useDailyChallenge } from '@/hooks/useDailyChallenge';

interface DailyChallengeProps {
  dailyChallenge: ReturnType<typeof useDailyChallenge>['dailyChallenge'];
  dailyStats: ReturnType<typeof useDailyChallenge>['dailyStats'];
  onPlay: () => void;
  onClose: () => void;
}

const DailyChallenge = ({ dailyChallenge, dailyStats, onPlay, onClose }: DailyChallengeProps) => {
  const difficultyColors = {
    easy: 'text-sudoku-easy',
    medium: 'text-sudoku-medium',
    hard: 'text-sudoku-hard',
    expert: 'text-sudoku-expert',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Daily Challenge</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {dailyChallenge && (
          <div className="space-y-6">
            {/* Today's Challenge */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="text-sm text-muted-foreground mb-2">Today's Puzzle</div>
              <div className="flex items-center justify-between">
                <span className={`font-display text-xl font-bold capitalize ${difficultyColors[dailyChallenge.difficulty]}`}>
                  {dailyChallenge.difficulty}
                </span>
                {dailyChallenge.completed ? (
                  <div className="flex items-center gap-2 text-sudoku-success">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Completed!</span>
                  </div>
                ) : (
                  <Button onClick={onPlay} className="bg-primary hover:bg-primary/90">
                    Play Now
                  </Button>
                )}
              </div>
              {dailyChallenge.completed && dailyChallenge.time && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Time: {formatTime(dailyChallenge.time)}</span>
                  <span className="mx-2">•</span>
                  <span>Mistakes: {dailyChallenge.mistakes}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                </div>
                <div className="text-3xl font-display font-bold text-foreground">
                  {dailyStats.currentStreak}
                  <span className="text-sm text-muted-foreground ml-1">days</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-4 border border-primary/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Best Streak</span>
                </div>
                <div className="text-3xl font-display font-bold text-foreground">
                  {dailyStats.longestStreak}
                  <span className="text-sm text-muted-foreground ml-1">days</span>
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Completed</div>
              <div className="text-2xl font-display font-bold text-foreground">
                {dailyStats.totalCompleted} puzzles
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DailyChallenge;
