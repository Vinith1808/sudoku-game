import { useEffect, useCallback } from "react";
import type { Board, Difficulty, Move } from "@/lib/sudoku";

export interface SavedGame {
  board: Board;
  solution: number[][];
  difficulty: Difficulty;
  mistakes: number;
  hintsUsed: number;
  elapsedTime: number;
  moveHistory: Move[];
  savedAt: number;
}

const STORAGE_KEY = "sudoku_saved_game";
const LEADERBOARD_KEY = "sudoku_leaderboard";

export interface LeaderboardEntry {
  difficulty: Difficulty;
  time: number;
  mistakes: number;
  hintsUsed: number;
  date: number;
}

export function useGamePersistence() {
  const saveGame = useCallback((game: SavedGame) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch (e) {
      console.error("Failed to save game:", e);
    }
  }, []);

  const loadGame = useCallback((): SavedGame | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load game:", e);
    }
    return null;
  }, []);

  const clearSavedGame = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear saved game:", e);
    }
  }, []);

  const hasSavedGame = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  return { saveGame, loadGame, clearSavedGame, hasSavedGame };
}

export function useLeaderboard() {
  const getLeaderboard = useCallback((): LeaderboardEntry[] => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load leaderboard:", e);
    }
    return [];
  }, []);

  const addEntry = useCallback((entry: Omit<LeaderboardEntry, "date">) => {
    try {
      const leaderboard = getLeaderboard();
      const newEntry: LeaderboardEntry = { ...entry, date: Date.now() };
      leaderboard.push(newEntry);
      
      // Sort by time (ascending) and keep top 10 per difficulty
      const sorted = leaderboard.sort((a, b) => a.time - b.time);
      const filtered: LeaderboardEntry[] = [];
      const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
      
      for (const e of sorted) {
        if (counts[e.difficulty] < 10) {
          filtered.push(e);
          counts[e.difficulty]++;
        }
      }
      
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(filtered));
      return newEntry;
    } catch (e) {
      console.error("Failed to add leaderboard entry:", e);
      return null;
    }
  }, [getLeaderboard]);

  const getTopScores = useCallback((difficulty: Difficulty, limit = 5): LeaderboardEntry[] => {
    const leaderboard = getLeaderboard();
    return leaderboard
      .filter(e => e.difficulty === difficulty)
      .sort((a, b) => a.time - b.time)
      .slice(0, limit);
  }, [getLeaderboard]);

  const clearLeaderboard = useCallback(() => {
    try {
      localStorage.removeItem(LEADERBOARD_KEY);
    } catch (e) {
      console.error("Failed to clear leaderboard:", e);
    }
  }, []);

  return { getLeaderboard, addEntry, getTopScores, clearLeaderboard };
}
