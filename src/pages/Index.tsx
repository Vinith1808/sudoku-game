import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SudokuGame } from "@/components/SudokuGame";
import { useGamePersistence, type SavedGame } from "@/hooks/useGamePersistence";
import type { Difficulty } from "@/lib/sudoku";

const Index = () => {
  const [gameState, setGameState] = useState<"menu" | "playing">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [loadSavedGame, setLoadSavedGame] = useState(false);

  const { loadGame, hasSavedGame, clearSavedGame } = useGamePersistence();

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setSavedGame(saved);
    }
  }, [loadGame]);

  const handleSelectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setLoadSavedGame(false);
    // Clear saved game when starting new game
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

  const handleBackToMenu = () => {
    setGameState("menu");
    setLoadSavedGame(false);
    // Refresh saved game state
    const saved = loadGame();
    setSavedGame(saved);
  };

  return (
    <main className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {gameState === "menu" ? (
          <DifficultySelector 
            key="menu" 
            onSelect={handleSelectDifficulty}
            hasSavedGame={!!savedGame}
            savedGameDifficulty={savedGame?.difficulty}
            onContinue={handleContinue}
          />
        ) : (
          <SudokuGame
            key="game"
            difficulty={difficulty}
            onBack={handleBackToMenu}
            savedGame={loadSavedGame ? savedGame : null}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
