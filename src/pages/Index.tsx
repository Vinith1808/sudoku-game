import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DifficultySelector } from "@/components/DifficultySelector";
import { SudokuGame } from "@/components/SudokuGame";
import type { Difficulty } from "@/lib/sudoku";

const Index = () => {
  const [gameState, setGameState] = useState<"menu" | "playing">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const handleSelectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState("playing");
  };

  const handleBackToMenu = () => {
    setGameState("menu");
  };

  return (
    <main className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {gameState === "menu" ? (
          <DifficultySelector key="menu" onSelect={handleSelectDifficulty} />
        ) : (
          <SudokuGame
            key="game"
            difficulty={difficulty}
            onBack={handleBackToMenu}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
