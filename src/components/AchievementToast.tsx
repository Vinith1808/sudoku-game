import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/hooks/useAchievements';

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

const AchievementToast = ({ achievements, onDismiss }: AchievementToastProps) => {
  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
        onClick={onDismiss}
      >
        <motion.div
          className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/50 rounded-2xl p-4 backdrop-blur-lg shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 20px hsla(var(--primary), 0.3)',
              '0 0 40px hsla(var(--primary), 0.5)',
              '0 0 20px hsla(var(--primary), 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Trophy className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Achievement Unlocked!</p>
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center gap-2 mt-1"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="font-display font-bold text-foreground">{achievement.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
