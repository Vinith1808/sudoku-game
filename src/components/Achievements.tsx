import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/hooks/useAchievements';

interface AchievementsProps {
  achievements: Achievement[];
  onClose: () => void;
}

const Achievements = ({ achievements, onClose }: AchievementsProps) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

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
        className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Achievements</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          {unlockedCount} / {achievements.length} unlocked
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                achievement.unlockedAt
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-3xl ${!achievement.unlockedAt && 'grayscale'}`}>
                  {achievement.unlockedAt ? achievement.icon : <Lock className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  
                  {achievement.maxProgress && !achievement.unlockedAt && (
                    <div className="mt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.progress || 0} / {achievement.maxProgress}
                      </p>
                    </div>
                  )}
                  
                  {achievement.unlockedAt && (
                    <p className="text-xs text-primary mt-1">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Achievements;
