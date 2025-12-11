import { useState, useCallback, useEffect } from 'react';
import type { Difficulty } from '@/lib/sudoku';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

const ACHIEVEMENTS_KEY = 'sudoku_achievements';
const STATS_KEY = 'sudoku_stats';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  easyWins: number;
  mediumWins: number;
  hardWins: number;
  expertWins: number;
  perfectGames: number; // No mistakes
  noHintGames: number;
  totalMistakes: number;
  totalHintsUsed: number;
  fastestEasy?: number;
  fastestMedium?: number;
  fastestHard?: number;
  fastestExpert?: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayDate?: string;
}

const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  easyWins: 0,
  mediumWins: 0,
  hardWins: 0,
  expertWins: 0,
  perfectGames: 0,
  noHintGames: 0,
  totalMistakes: 0,
  totalHintsUsed: 0,
  currentStreak: 0,
  longestStreak: 0,
};

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  { id: 'first_win', name: 'First Victory', description: 'Complete your first puzzle', icon: '🏆' },
  { id: 'easy_master', name: 'Easy Master', description: 'Complete 5 Easy puzzles', icon: '🌟', maxProgress: 5 },
  { id: 'medium_master', name: 'Medium Master', description: 'Complete 5 Medium puzzles', icon: '⭐', maxProgress: 5 },
  { id: 'hard_master', name: 'Hard Master', description: 'Complete 5 Hard puzzles', icon: '💫', maxProgress: 5 },
  { id: 'expert_master', name: 'Expert Master', description: 'Complete 5 Expert puzzles', icon: '🌠', maxProgress: 5 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a puzzle with no mistakes', icon: '💎' },
  { id: 'no_hints', name: 'Independent', description: 'Complete a puzzle without using hints', icon: '🧠' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete Easy in under 3 minutes', icon: '⚡' },
  { id: 'streak_3', name: 'On Fire', description: 'Win 3 games in a row', icon: '🔥', maxProgress: 3 },
  { id: 'streak_7', name: 'Unstoppable', description: 'Win 7 games in a row', icon: '💪', maxProgress: 7 },
  { id: 'dedicated', name: 'Dedicated', description: 'Play 25 games', icon: '🎮', maxProgress: 25 },
  { id: 'true_master', name: 'True Master', description: 'Complete Expert with no mistakes or hints', icon: '👑' },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  // Load achievements and stats
  useEffect(() => {
    try {
      const savedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
      const savedStats = localStorage.getItem(STATS_KEY);
      
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      } else {
        setAchievements(ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, progress: 0 })));
      }
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }, []);

  const saveAchievements = useCallback((newAchievements: Achievement[]) => {
    setAchievements(newAchievements);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newAchievements));
  }, []);

  const saveStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  }, []);

  const unlockAchievement = useCallback((id: string, achievements: Achievement[]): Achievement[] => {
    return achievements.map(a => {
      if (a.id === id && !a.unlockedAt) {
        const unlocked = { ...a, unlockedAt: Date.now() };
        setNewUnlocks(prev => [...prev, unlocked]);
        return unlocked;
      }
      return a;
    });
  }, []);

  const updateProgress = useCallback((id: string, progress: number, achievements: Achievement[]): Achievement[] => {
    return achievements.map(a => {
      if (a.id === id) {
        const newProgress = Math.min(progress, a.maxProgress || progress);
        if (a.maxProgress && newProgress >= a.maxProgress && !a.unlockedAt) {
          const unlocked = { ...a, progress: newProgress, unlockedAt: Date.now() };
          setNewUnlocks(prev => [...prev, unlocked]);
          return unlocked;
        }
        return { ...a, progress: newProgress };
      }
      return a;
    });
  }, []);

  const recordGameComplete = useCallback((
    difficulty: Difficulty,
    time: number,
    mistakes: number,
    hintsUsed: number,
    won: boolean
  ) => {
    const today = new Date().toDateString();
    
    setStats(prevStats => {
      let newStats = { ...prevStats };
      newStats.gamesPlayed++;
      
      if (won) {
        newStats.gamesWon++;
        
        // Update difficulty-specific wins
        if (difficulty === 'easy') {
          newStats.easyWins++;
          if (!newStats.fastestEasy || time < newStats.fastestEasy) {
            newStats.fastestEasy = time;
          }
        } else if (difficulty === 'medium') {
          newStats.mediumWins++;
          if (!newStats.fastestMedium || time < newStats.fastestMedium) {
            newStats.fastestMedium = time;
          }
        } else if (difficulty === 'hard') {
          newStats.hardWins++;
          if (!newStats.fastestHard || time < newStats.fastestHard) {
            newStats.fastestHard = time;
          }
        } else if (difficulty === 'expert') {
          newStats.expertWins++;
          if (!newStats.fastestExpert || time < newStats.fastestExpert) {
            newStats.fastestExpert = time;
          }
        }
        
        if (mistakes === 0) newStats.perfectGames++;
        if (hintsUsed === 0) newStats.noHintGames++;
        
        // Update streak
        if (newStats.lastPlayDate === today || !newStats.lastPlayDate) {
          newStats.currentStreak++;
        } else {
          const lastDate = new Date(newStats.lastPlayDate);
          const diff = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            newStats.currentStreak++;
          } else {
            newStats.currentStreak = 1;
          }
        }
        newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
      } else {
        newStats.currentStreak = 0;
      }
      
      newStats.totalMistakes += mistakes;
      newStats.totalHintsUsed += hintsUsed;
      newStats.lastPlayDate = today;
      
      saveStats(newStats);
      return newStats;
    });

    // Check achievements
    setAchievements(prevAchievements => {
      let updated = [...prevAchievements];
      
      if (won) {
        updated = unlockAchievement('first_win', updated);
        
        const newStats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        
        updated = updateProgress('easy_master', newStats.easyWins || 0, updated);
        updated = updateProgress('medium_master', newStats.mediumWins || 0, updated);
        updated = updateProgress('hard_master', newStats.hardWins || 0, updated);
        updated = updateProgress('expert_master', newStats.expertWins || 0, updated);
        updated = updateProgress('dedicated', newStats.gamesPlayed || 0, updated);
        updated = updateProgress('streak_3', newStats.currentStreak || 0, updated);
        updated = updateProgress('streak_7', newStats.currentStreak || 0, updated);
        
        if (mistakes === 0) updated = unlockAchievement('perfectionist', updated);
        if (hintsUsed === 0) updated = unlockAchievement('no_hints', updated);
        if (difficulty === 'easy' && time < 180) updated = unlockAchievement('speed_demon', updated);
        if (difficulty === 'expert' && mistakes === 0 && hintsUsed === 0) {
          updated = unlockAchievement('true_master', updated);
        }
      }
      
      saveAchievements(updated);
      return updated;
    });
  }, [saveStats, saveAchievements, unlockAchievement, updateProgress]);

  const clearNewUnlocks = useCallback(() => {
    setNewUnlocks([]);
  }, []);

  const getStats = useCallback(() => stats, [stats]);

  return {
    achievements,
    stats,
    newUnlocks,
    recordGameComplete,
    clearNewUnlocks,
    getStats,
  };
}
