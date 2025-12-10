export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number | null;
  isPreset: boolean;
  notes: number[];
  isError: boolean;
  isHighlighted: boolean;
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  solution: number[][];
  selectedCell: { row: number; col: number } | null;
  difficulty: Difficulty;
  mistakes: number;
  hintsUsed: number;
  isComplete: boolean;
  startTime: number;
  elapsedTime: number;
  moveHistory: Move[];
}

export interface Move {
  row: number;
  col: number;
  previousValue: number | null;
  newValue: number | null;
  previousNotes: number[];
  newNotes: number[];
}

const DIFFICULTY_CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 58,
};

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if a number can be placed at position
function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

// Solve the sudoku using backtracking
function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate a complete valid sudoku
function generateCompleteSudoku(): number[][] {
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
  solveSudoku(grid);
  return grid;
}

// Remove cells to create the puzzle
function removeCells(grid: number[][], count: number): number[][] {
  const puzzle = grid.map(row => [...row]);
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  for (const pos of positions) {
    if (removed >= count) break;
    const backup = puzzle[pos.row][pos.col];
    puzzle[pos.row][pos.col] = 0;
    removed++;
  }

  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: number[][] } {
  const solution = generateCompleteSudoku();
  const puzzleNumbers = removeCells(solution, DIFFICULTY_CELLS_TO_REMOVE[difficulty]);

  const puzzle: Board = puzzleNumbers.map(row =>
    row.map(value => ({
      value: value === 0 ? null : value,
      isPreset: value !== 0,
      notes: [],
      isError: false,
      isHighlighted: false,
    }))
  );

  return { puzzle, solution };
}

export function checkValue(solution: number[][], row: number, col: number, value: number): boolean {
  return solution[row][col] === value;
}

export function isBoardComplete(board: Board, solution: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

export function getRelatedCells(row: number, col: number): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  
  // Same row
  for (let c = 0; c < 9; c++) {
    if (c !== col) cells.push({ row, col: c });
  }
  
  // Same column
  for (let r = 0; r < 9; r++) {
    if (r !== row) cells.push({ row: r, col });
  }
  
  // Same 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (r !== row || c !== col) {
        if (!cells.some(cell => cell.row === r && cell.col === c)) {
          cells.push({ row: r, col: c });
        }
      }
    }
  }
  
  return cells;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
