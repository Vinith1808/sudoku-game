import { useState, useCallback, useEffect } from 'react';
import type { Board, Difficulty } from '@/lib/sudoku';
import { generatePuzzle } from '@/lib/sudoku';

const DAILY_KEY = 'sudoku_daily_challenge';
const DAILY_STATS_KEY = 'sudoku_daily_stats';

interface DailyChallenge {
  date: string;
  seed: number;
  difficulty: Difficulty;
  board: Board;
  solution: number[][];
  completed: boolean;
  time?: number;
  mistakes?: number;
}

interface DailyStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  lastCompletedDate?: string;
  bestTimes: { [key: string]: number };
}

// Simple seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function getDailyDifficulty(seed: number): Difficulty {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const index = Math.floor(seededRandom(seed) * difficulties.length);
  return difficulties[index];
}

export function useDailyChallenge() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalCompleted: 0,
    bestTimes: {},
  });

  const getTodayString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load daily stats
    try {
      const savedStats = localStorage.getItem(DAILY_STATS_KEY);
      if (savedStats) {
        setDailyStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error('Failed to load daily stats:', e);
    }

    // Load or generate daily challenge
    const today = getTodayString();
    try {
      const saved = localStorage.getItem(DAILY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setDailyChallenge(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load daily challenge:', e);
    }

    // Generate new daily challenge
    const seed = getDailySeed();
    const difficulty = getDailyDifficulty(seed);
    const { puzzle, solution } = generatePuzzle(difficulty);
    const newChallenge: DailyChallenge = {
      date: today,
      seed,
      difficulty,
      board: puzzle,
      solution,
      completed: false,
    };
    
    setDailyChallenge(newChallenge);
    localStorage.setItem(DAILY_KEY, JSON.stringify(newChallenge));
  }, []);

  const completeDailyChallenge = useCallback((time: number, mistakes: number) => {
    if (!dailyChallenge || dailyChallenge.completed) return;

    const today = getTodayString();
    
    // Update challenge
    const updatedChallenge = {
      ...dailyChallenge,
      completed: true,
      time,
      mistakes,
    };
    setDailyChallenge(updatedChallenge);
    localStorage.setItem(DAILY_KEY, JSON.stringify(updatedChallenge));

    // Update stats
    setDailyStats(prevStats => {
      const newStats = { ...prevStats };
      newStats.totalCompleted++;
      
      // Update streak
      if (prevStats.lastCompletedDate) {
        const lastDate = new Date(prevStats.lastCompletedDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStats.currentStreak = prevStats.currentStreak + 1;
        } else if (diffDays > 1) {
          newStats.currentStreak = 1;
        }
      } else {
        newStats.currentStreak = 1;
      }
      
      newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
      newStats.lastCompletedDate = today;
      
      // Update best time
      const dateKey = today;
      if (!newStats.bestTimes[dateKey] || time < newStats.bestTimes[dateKey]) {
        newStats.bestTimes[dateKey] = time;
      }
      
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, [dailyChallenge]);

  const isDailyCompleted = useCallback(() => {
    return dailyChallenge?.completed || false;
  }, [dailyChallenge]);

  const getDailyChallenge = useCallback(() => {
    return dailyChallenge;
  }, [dailyChallenge]);

  return {
    dailyChallenge,
    dailyStats,
    completeDailyChallenge,
    isDailyCompleted,
    getDailyChallenge,
  };
}
