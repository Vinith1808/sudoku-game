import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Settings, Trophy, Cpu, Save } from "lucide-react";
import { SudokuBoard } from "./SudokuBoard";
import { NumberPad } from "./NumberPad";
import { GameHeader } from "./GameHeader";
import { GameComplete } from "./GameComplete";
import { AISolver } from "./AISolver";
import { Leaderboard } from "./Leaderboard";
import { SettingsPanel } from "./SettingsPanel";
import {
  generatePuzzle,
  checkValue,
  isBoardComplete,
  type Difficulty,
  type Board,
  type Move,
} from "@/lib/sudoku";
import { useGamePersistence, useLeaderboard, type SavedGame } from "@/hooks/useGamePersistence";
import { useSoundEffects, useAmbientMusic } from "@/hooks/useSoundEffects";
import { toast } from "@/hooks/use-toast";

interface SudokuGameProps {
  difficulty: Difficulty;
  onBack: () => void;
  savedGame?: SavedGame | null;
  dailyBoard?: { board: Board; solution: number[][] } | null;
  onGameComplete?: (won: boolean, time: number, mistakes: number, hintsUsed: number) => void;
}

const MAX_MISTAKES = 3;

export function SudokuGame({ difficulty, onBack, savedGame, dailyBoard, onGameComplete }: SudokuGameProps) {
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cellAnimationKeys, setCellAnimationKeys] = useState<string[][]>([]);
  const [showAISolver, setShowAISolver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { saveGame, clearSavedGame } = useGamePersistence();
  const { addEntry } = useLeaderboard();
  const { playSound, soundEnabled, toggleSound, initAudio } = useSoundEffects();
  const { toggleMusic, musicEnabled, startMusic } = useAmbientMusic();

  // Initialize game
  useEffect(() => {
    if (dailyBoard) {
      // Daily challenge
      setBoard(dailyBoard.board.map(row => row.map(cell => ({ ...cell }))));
      setSolution(dailyBoard.solution);
      setCellAnimationKeys(
        dailyBoard.board.map((row, ri) => row.map((_, ci) => `${ri}-${ci}-${Date.now()}`))
      );
      setMistakes(0);
      setHintsUsed(0);
      setMoveHistory([]);
      setElapsedTime(0);
    } else if (savedGame && savedGame.difficulty === difficulty) {
      // Load saved game
      setBoard(savedGame.board);
      setSolution(savedGame.solution);
      setMistakes(savedGame.mistakes);
      setHintsUsed(savedGame.hintsUsed);
      setElapsedTime(savedGame.elapsedTime);
      setMoveHistory(savedGame.moveHistory);
      setCellAnimationKeys(
        savedGame.board.map((row, ri) => row.map((_, ci) => `${ri}-${ci}-${Date.now()}`))
      );
      toast({
        title: "Game Restored",
        description: "Your previous game has been loaded.",
      });
    } else {
      // New game
      const { puzzle, solution: sol } = generatePuzzle(difficulty);
      setBoard(puzzle);
      setSolution(sol);
      setCellAnimationKeys(
        puzzle.map((row, ri) => row.map((_, ci) => `${ri}-${ci}-${Date.now()}`))
      );
      setMistakes(0);
      setHintsUsed(0);
      setMoveHistory([]);
      setElapsedTime(0);
    }
    setIsComplete(false);
    setIsGameOver(false);
    setSelectedCell(null);
  }, [difficulty, savedGame, dailyBoard]);

  // Auto-save game periodically
  useEffect(() => {
    if (isComplete || isGameOver || board.length === 0) return;

    const saveInterval = setInterval(() => {
      saveGame({
        board,
        solution,
        difficulty,
        mistakes,
        hintsUsed,
        elapsedTime,
        moveHistory,
        savedAt: Date.now(),
      });
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [board, solution, difficulty, mistakes, hintsUsed, elapsedTime, moveHistory, isComplete, isGameOver, saveGame]);

  // Timer
  useEffect(() => {
    if (isComplete || isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete, isGameOver, isPaused]);

  // Start ambient music on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      if (musicEnabled) {
        startMusic();
      }
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, [initAudio, musicEnabled, startMusic]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || isGameOver || showAISolver || showLeaderboard || showSettings) return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "n" || e.key === "N") {
        setNotesMode((prev) => !prev);
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      } else if (e.key === "ArrowUp" && selectedCell && selectedCell.row > 0) {
        setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
        playSound("click");
      } else if (e.key === "ArrowDown" && selectedCell && selectedCell.row < 8) {
        setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
        playSound("click");
      } else if (e.key === "ArrowLeft" && selectedCell && selectedCell.col > 0) {
        setSelectedCell({ ...selectedCell, col: selectedCell.col - 1 });
        playSound("click");
      } else if (e.key === "ArrowRight" && selectedCell && selectedCell.col < 8) {
        setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 });
        playSound("click");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, notesMode, isComplete, isGameOver, showAISolver, showLeaderboard, showSettings]);

  const updateCellAnimationKey = (row: number, col: number) => {
    setCellAnimationKeys((prev) => {
      const newKeys = prev.map((r) => [...r]);
      newKeys[row][col] = `${row}-${col}-${Date.now()}`;
      return newKeys;
    });
  };

  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selectedCell || isComplete || isGameOver) return;

      const { row, col } = selectedCell;
      const cell = board[row][col];

      if (cell.isPreset) return;

      const move: Move = {
        row,
        col,
        previousValue: cell.value,
        newValue: notesMode ? null : num,
        previousNotes: [...cell.notes],
        newNotes: notesMode
          ? cell.notes.includes(num)
            ? cell.notes.filter((n) => n !== num)
            : [...cell.notes, num]
          : [],
      };

      setMoveHistory((prev) => [...prev, move]);

      if (notesMode) {
        setBoard((prev) => {
          const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].notes = move.newNotes;
          newBoard[row][col].value = null;
          return newBoard;
        });
        playSound("click");
      } else {
        const isCorrect = checkValue(solution, row, col, num);

        setBoard((prev) => {
          const newBoard = prev.map((r) => r.map((c) => ({ ...c, isError: false })));
          newBoard[row][col].value = num;
          newBoard[row][col].notes = [];
          newBoard[row][col].isError = !isCorrect;

          if (isCorrect) {
            // Clear this number from notes in related cells
            for (let i = 0; i < 9; i++) {
              newBoard[row][i].notes = newBoard[row][i].notes.filter((n) => n !== num);
              newBoard[i][col].notes = newBoard[i][col].notes.filter((n) => n !== num);
            }
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
              for (let c = boxCol; c < boxCol + 3; c++) {
                newBoard[r][c].notes = newBoard[r][c].notes.filter((n) => n !== num);
              }
            }
          }

          return newBoard;
        });

        updateCellAnimationKey(row, col);

        if (!isCorrect) {
          playSound("error");
          const newMistakes = mistakes + 1;
          setMistakes(newMistakes);
          
          toast({
            title: "Incorrect!",
            description: `${MAX_MISTAKES - newMistakes} mistakes remaining`,
            variant: "destructive",
          });

          if (newMistakes >= MAX_MISTAKES) {
            setIsGameOver(true);
            clearSavedGame();
            onGameComplete?.(false, elapsedTime, newMistakes, hintsUsed);
          }
        } else {
          playSound("place");
          // Check if complete
          const newBoard = board.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].value = num;
          if (isBoardComplete(newBoard, solution)) {
            setIsComplete(true);
            clearSavedGame();
            playSound("complete");
            addEntry({ difficulty, time: elapsedTime, mistakes, hintsUsed });
            onGameComplete?.(true, elapsedTime, mistakes, hintsUsed);
          }
        }
      }
    },
    [board, selectedCell, notesMode, solution, mistakes, isComplete, isGameOver, playSound, clearSavedGame, addEntry, difficulty, elapsedTime, hintsUsed]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || isComplete || isGameOver) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isPreset || (!cell.value && cell.notes.length === 0)) return;

    const move: Move = {
      row,
      col,
      previousValue: cell.value,
      newValue: null,
      previousNotes: [...cell.notes],
      newNotes: [],
    };

    setMoveHistory((prev) => [...prev, move]);

    setBoard((prev) => {
      const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col].value = null;
      newBoard[row][col].notes = [];
      newBoard[row][col].isError = false;
      return newBoard;
    });

    updateCellAnimationKey(row, col);
    playSound("click");
  }, [board, selectedCell, isComplete, isGameOver, playSound]);

  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || isComplete || isGameOver) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    setMoveHistory((prev) => prev.slice(0, -1));

    setBoard((prev) => {
      const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
      newBoard[lastMove.row][lastMove.col].value = lastMove.previousValue;
      newBoard[lastMove.row][lastMove.col].notes = lastMove.previousNotes;
      newBoard[lastMove.row][lastMove.col].isError = false;
      return newBoard;
    });

    updateCellAnimationKey(lastMove.row, lastMove.col);
    playSound("undo");
  }, [moveHistory, isComplete, isGameOver, playSound]);

  const handleHint = useCallback(() => {
    if (isComplete || isGameOver) return;

    // Find an empty cell
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!board[row][col].value && !board[row][col].isPreset) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const correctValue = solution[randomCell.row][randomCell.col];

    setBoard((prev) => {
      const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
      newBoard[randomCell.row][randomCell.col].value = correctValue;
      newBoard[randomCell.row][randomCell.col].notes = [];
      newBoard[randomCell.row][randomCell.col].isHighlighted = true;

      // Clear highlight after animation
      setTimeout(() => {
        setBoard((b) => {
          const nb = b.map((r) => r.map((c) => ({ ...c })));
          nb[randomCell.row][randomCell.col].isHighlighted = false;
          return nb;
        });
      }, 1000);

      return newBoard;
    });

    updateCellAnimationKey(randomCell.row, randomCell.col);
    setHintsUsed((prev) => prev + 1);
    setSelectedCell(randomCell);
    playSound("hint");

    // Check if complete after hint
    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[randomCell.row][randomCell.col].value = correctValue;
    if (isBoardComplete(newBoard, solution)) {
      setIsComplete(true);
      clearSavedGame();
      playSound("complete");
      addEntry({ difficulty, time: elapsedTime, mistakes, hintsUsed: hintsUsed + 1 });
    }
  }, [board, solution, isComplete, isGameOver, playSound, clearSavedGame, addEntry, difficulty, elapsedTime, mistakes, hintsUsed]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    playSound("click");
  };

  // Calculate number counts
  const numberCounts = Array.from({ length: 9 }, (_, i) => i + 1).reduce(
    (acc, num) => {
      acc[num] = board.reduce(
        (count, row) => count + row.filter((c) => c.value === num).length,
        0
      );
      return acc;
    },
    {} as Record<number, number>
  );

  const handleSaveAndExit = () => {
    saveGame({
      board,
      solution,
      difficulty,
      mistakes,
      hintsUsed,
      elapsedTime,
      moveHistory,
      savedAt: Date.now(),
    });
    toast({
      title: "Game Saved",
      description: "Your progress has been saved.",
    });
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <motion.div
        className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />

      {/* Header controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 relative z-10"
      >
        <button
          onClick={handleSaveAndExit}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-rajdhani font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Save & Exit</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-2 rounded-lg bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowAISolver(true)}
            className="p-2 rounded-lg bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
            title="AI Solver"
          >
            <Cpu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            <span className="hidden sm:inline font-rajdhani font-medium">
              {isPaused ? "Resume" : "Pause"}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <GameHeader
          difficulty={difficulty}
          elapsedTime={elapsedTime}
          mistakes={mistakes}
          maxMistakes={MAX_MISTAKES}
          hintsUsed={hintsUsed}
        />

        {isPaused ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-[500px] aspect-square flex items-center justify-center bg-card/80 rounded-xl backdrop-blur-sm"
          >
            <div className="text-center">
              <h2 className="font-orbitron text-2xl text-muted-foreground mb-4">PAUSED</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-orbitron hover:box-glow-primary transition-all"
              >
                Resume
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <SudokuBoard
              board={board}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              cellAnimationKeys={cellAnimationKeys}
            />

            <NumberPad
              onNumberClick={handleNumberInput}
              onErase={handleErase}
              onHint={handleHint}
              onUndo={handleUndo}
              notesMode={notesMode}
              onToggleNotes={() => setNotesMode((p) => !p)}
              numberCounts={numberCounts}
              disabled={isComplete || isGameOver}
            />
          </>
        )}
      </div>

      {/* Game complete overlay */}
      {(isComplete || isGameOver) && (
        <GameComplete
          difficulty={difficulty}
          time={elapsedTime}
          mistakes={mistakes}
          hintsUsed={hintsUsed}
          onNewGame={onBack}
          isWin={isComplete}
        />
      )}

      {/* AI Solver modal */}
      <AnimatePresence>
        {showAISolver && board.length > 0 && (
          <AISolver
            initialBoard={board}
            onClose={() => setShowAISolver(false)}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard
            onClose={() => setShowLeaderboard(false)}
            currentDifficulty={difficulty}
          />
        )}
      </AnimatePresence>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            musicEnabled={musicEnabled}
            onToggleMusic={toggleMusic}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
