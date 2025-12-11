import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SudokuBoard } from './SudokuBoard';
import { NumberPad } from './NumberPad';
import { generatePuzzle, checkValue, isBoardComplete, formatTime, type Board, type Difficulty } from '@/lib/sudoku';

interface MultiplayerGameProps {
  difficulty: Difficulty;
  onClose: () => void;
}

interface PlayerState {
  board: Board;
  mistakes: number;
  progress: number;
  finished: boolean;
  finishTime?: number;
}

const MultiplayerGame = ({ difficulty, onClose }: MultiplayerGameProps) => {
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [player1, setPlayer1] = useState<PlayerState | null>(null);
  const [player2, setPlayer2] = useState<PlayerState | null>(null);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Initialize game
  useEffect(() => {
    const { puzzle, solution: sol } = generatePuzzle(difficulty);
    setSolution(sol);
    
    // Deep clone the board for both players
    const cloneBoard = (b: Board): Board => 
      b.map(row => row.map(cell => ({ ...cell })));
    
    setPlayer1({
      board: cloneBoard(puzzle),
      mistakes: 0,
      progress: 0,
      finished: false,
    });
    
    setPlayer2({
      board: cloneBoard(puzzle),
      mistakes: 0,
      progress: 0,
      finished: false,
    });
  }, [difficulty]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  // Timer
  useEffect(() => {
    if (!gameStarted || winner) return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, winner]);

  const calculateProgress = useCallback((board: Board): number => {
    let filled = 0;
    let total = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (!cell.isPreset) {
          total++;
          if (cell.value !== 0) filled++;
        }
      });
    });
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, []);

  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || !solution || winner) return;
    
    const { row, col } = selectedCell;
    const playerState = activePlayer === 1 ? player1 : player2;
    const setPlayerState = activePlayer === 1 ? setPlayer1 : setPlayer2;
    
    if (!playerState || playerState.board[row][col].isPreset) return;
    
    const newBoard = playerState.board.map(r => r.map(c => ({ ...c })));
    const isCorrect = checkValue(solution, row, col, num);
    
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: num,
      isError: !isCorrect,
    };
    
    const newProgress = calculateProgress(newBoard);
    const isComplete = isBoardComplete(newBoard, solution) && newBoard.every(r => r.every(c => !c.isError));
    
    setPlayerState({
      ...playerState,
      board: newBoard,
      mistakes: isCorrect ? playerState.mistakes : playerState.mistakes + 1,
      progress: newProgress,
      finished: isComplete,
      finishTime: isComplete ? elapsedTime : undefined,
    });
    
    if (isComplete) {
      setWinner(activePlayer);
    }
  }, [selectedCell, solution, activePlayer, player1, player2, elapsedTime, calculateProgress, winner]);

  const handleErase = useCallback(() => {
    if (!selectedCell || winner) return;
    
    const { row, col } = selectedCell;
    const playerState = activePlayer === 1 ? player1 : player2;
    const setPlayerState = activePlayer === 1 ? setPlayer1 : setPlayer2;
    
    if (!playerState || playerState.board[row][col].isPreset) return;
    
    const newBoard = playerState.board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col] = {
      ...newBoard[row][col],
      value: 0,
      isError: false,
    };
    
    setPlayerState({
      ...playerState,
      board: newBoard,
      progress: calculateProgress(newBoard),
    });
  }, [selectedCell, activePlayer, player1, player2, calculateProgress, winner]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setActivePlayer(p => p === 1 ? 2 : 1);
        return;
      }
      
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, handleErase]);

  if (!player1 || !player2 || !solution) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col z-50"
    >
      {/* Countdown */}
      <AnimatePresence>
        {countdown > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-background/80"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-8xl font-display font-bold text-primary"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-background/90"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Trophy className="w-24 h-24 mx-auto text-primary mb-4" />
              </motion.div>
              <h2 className="text-4xl font-display font-bold text-foreground mb-2">
                Player {winner} Wins!
              </h2>
              <p className="text-muted-foreground mb-6">
                Time: {formatTime(elapsedTime)}
              </p>
              <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
                Back to Menu
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">Multiplayer Race</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="font-mono text-foreground">{formatTime(elapsedTime)}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto">
        {/* Player 1 */}
        <div 
          className={`flex-1 flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
            activePlayer === 1 ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onClick={() => setActivePlayer(1)}
        >
          <div className="flex items-center justify-between w-full max-w-md">
            <h3 className="font-display text-lg font-bold text-foreground">Player 1</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Progress: {player1.progress}%</span>
              <span className="text-sudoku-error">Mistakes: {player1.mistakes}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-md">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${player1.progress}%` }}
            />
          </div>
          <div className="transform scale-75 lg:scale-90 origin-top">
            <SudokuBoard
              board={player1.board}
              selectedCell={activePlayer === 1 ? selectedCell : null}
              onCellClick={activePlayer === 1 ? handleCellSelect : () => {}}
              cellAnimationKeys={player1.board.map((row, r) => row.map((_, c) => `p1-${r}-${c}`))}
            />
          </div>
        </div>

        {/* Number Pad (center) */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-sm text-muted-foreground mb-2">
            Press Tab to switch players
          </div>
          <NumberPad
            onNumberClick={handleNumberInput}
            onErase={handleErase}
            onHint={() => {}}
            onUndo={() => {}}
            onToggleNotes={() => {}}
            notesMode={false}
            numberCounts={{1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0}}
            disabled={!!winner}
          />
        </div>

        {/* Player 2 */}
        <div 
          className={`flex-1 flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
            activePlayer === 2 ? 'border-accent bg-accent/5' : 'border-border'
          }`}
          onClick={() => setActivePlayer(2)}
        >
          <div className="flex items-center justify-between w-full max-w-md">
            <h3 className="font-display text-lg font-bold text-foreground">Player 2</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Progress: {player2.progress}%</span>
              <span className="text-sudoku-error">Mistakes: {player2.mistakes}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden max-w-md">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${player2.progress}%` }}
            />
          </div>
          <div className="transform scale-75 lg:scale-90 origin-top">
            <SudokuBoard
              board={player2.board}
              selectedCell={activePlayer === 2 ? selectedCell : null}
              onCellClick={activePlayer === 2 ? handleCellSelect : () => {}}
              cellAnimationKeys={player2.board.map((row, r) => row.map((_, c) => `p2-${r}-${c}`))}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MultiplayerGame;
