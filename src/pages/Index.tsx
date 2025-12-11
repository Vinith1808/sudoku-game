import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SudokuGame } from "@/components/SudokuGame";
import { useGamePersistence, type SavedGame } from "@/hooks/useGamePersistence";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useAchievements } from "@/hooks/useAchievements";
import type { Difficulty, Board } from "@/lib/sudoku";
import MultiplayerGame from "@/components/MultiplayerGame";
import AchievementToast from "@/components/AchievementToast";
import BackgroundAnimation from "@/components/BackgroundAnimation";

type GameMode = "menu" | "playing" | "multiplayer" | "daily";

const Index = () => {
  const [gameState, setGameState] = useState<GameMode>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [loadSavedGame, setLoadSavedGame] = useState(false);
  const [dailyBoard, setDailyBoard] = useState<{ board: Board; solution: number[][] } | null>(null);

  const { loadGame, hasSavedGame, clearSavedGame } = useGamePersistence();
  const { dailyChallenge, completeDailyChallenge } = useDailyChallenge();
  const { newUnlocks, clearNewUnlocks, recordGameComplete } = useAchievements();

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setSavedGame(saved);
    }
  }, [loadGame]);

  const handleSelectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setLoadSavedGame(false);
    if (hasSavedGame()) {
      clearSavedGame();
    }
    setGameState("playing");
  };

  const handleContinue = () => {
    if (savedGame) {
      setDifficulty(savedGame.difficulty);
      setLoadSavedGame(true);
      setGameState("playing");
    }
  };

  const handleMultiplayer = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState("multiplayer");
  };

  const handleDailyChallenge = () => {
    if (dailyChallenge && !dailyChallenge.completed) {
      setDailyBoard({ board: dailyChallenge.board, solution: dailyChallenge.solution });
      setDifficulty(dailyChallenge.difficulty);
      setGameState("daily");
    }
  };

  const handleBackToMenu = () => {
    setGameState("menu");
    setLoadSavedGame(false);
    setDailyBoard(null);
    const saved = loadGame();
    setSavedGame(saved);
  };

  const handleGameComplete = (won: boolean, time: number, mistakes: number, hintsUsed: number) => {
    recordGameComplete(difficulty, time, mistakes, hintsUsed, won);
    
    if (gameState === "daily" && won) {
      completeDailyChallenge(time, mistakes);
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      <BackgroundAnimation />
      
      <AchievementToast achievements={newUnlocks} onDismiss={clearNewUnlocks} />
      
      <AnimatePresence mode="wait">
        {gameState === "menu" ? (
          <DifficultySelector 
            key="menu" 
            onSelect={handleSelectDifficulty}
            hasSavedGame={!!savedGame}
            savedGameDifficulty={savedGame?.difficulty}
            onContinue={handleContinue}
            onMultiplayer={handleMultiplayer}
            onDailyChallenge={handleDailyChallenge}
          />
        ) : gameState === "multiplayer" ? (
          <MultiplayerGame
            key="multiplayer"
            difficulty={difficulty}
            onClose={handleBackToMenu}
          />
        ) : (
          <SudokuGame
            key="game"
            difficulty={difficulty}
            onBack={handleBackToMenu}
            savedGame={loadSavedGame ? savedGame : null}
            dailyBoard={gameState === "daily" ? dailyBoard : null}
            onGameComplete={handleGameComplete}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
