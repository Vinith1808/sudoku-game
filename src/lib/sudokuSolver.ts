export interface SolveStep {
  row: number;
  col: number;
  value: number;
  technique: "naked-single" | "hidden-single" | "elimination" | "backtrack";
  description: string;
  candidates?: number[];
  eliminatedFrom?: { row: number; col: number }[];
}

// Get all candidates for a cell
function getCandidates(grid: number[][], row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];
  
  const used = new Set<number>();
  
  // Row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] !== 0) used.add(grid[row][c]);
  }
  
  // Column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] !== 0) used.add(grid[r][col]);
  }
  
  // Box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] !== 0) used.add(grid[r][c]);
    }
  }
  
  const candidates: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) candidates.push(n);
  }
  
  return candidates;
}

// Find naked single - cell with only one candidate
function findNakedSingle(grid: number[][]): SolveStep | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const candidates = getCandidates(grid, row, col);
        if (candidates.length === 1) {
          return {
            row,
            col,
            value: candidates[0],
            technique: "naked-single",
            description: `Only ${candidates[0]} is possible in row ${row + 1}, column ${col + 1}`,
            candidates,
          };
        }
      }
    }
  }
  return null;
}

// Find hidden single - number that can only go in one cell in a unit
function findHiddenSingle(grid: number[][]): SolveStep | null {
  // Check rows
  for (let row = 0; row < 9; row++) {
    for (let num = 1; num <= 9; num++) {
      const positions: { col: number }[] = [];
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0 && getCandidates(grid, row, col).includes(num)) {
          positions.push({ col });
        }
      }
      if (positions.length === 1) {
        return {
          row,
          col: positions[0].col,
          value: num,
          technique: "hidden-single",
          description: `${num} can only go in column ${positions[0].col + 1} of row ${row + 1}`,
        };
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    for (let num = 1; num <= 9; num++) {
      const positions: { row: number }[] = [];
      for (let row = 0; row < 9; row++) {
        if (grid[row][col] === 0 && getCandidates(grid, row, col).includes(num)) {
          positions.push({ row });
        }
      }
      if (positions.length === 1) {
        return {
          row: positions[0].row,
          col,
          value: num,
          technique: "hidden-single",
          description: `${num} can only go in row ${positions[0].row + 1} of column ${col + 1}`,
        };
      }
    }
  }
  
  // Check boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      for (let num = 1; num <= 9; num++) {
        const positions: { row: number; col: number }[] = [];
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) {
              positions.push({ row: r, col: c });
            }
          }
        }
        if (positions.length === 1) {
          return {
            row: positions[0].row,
            col: positions[0].col,
            value: num,
            technique: "hidden-single",
            description: `${num} can only go in one cell of box ${boxRow * 3 + boxCol + 1}`,
          };
        }
      }
    }
  }
  
  return null;
}

// Find first empty cell for backtracking
function findEmptyCell(grid: number[][]): { row: number; col: number } | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return null;
}

// Generate all solving steps
export function generateSolveSteps(initialGrid: number[][]): SolveStep[] {
  const grid = initialGrid.map(row => [...row]);
  const steps: SolveStep[] = [];
  
  let iterations = 0;
  const maxIterations = 1000;
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Try naked single first
    let step = findNakedSingle(grid);
    if (step) {
      grid[step.row][step.col] = step.value;
      steps.push(step);
      continue;
    }
    
    // Try hidden single
    step = findHiddenSingle(grid);
    if (step) {
      grid[step.row][step.col] = step.value;
      steps.push(step);
      continue;
    }
    
    // Fall back to backtracking
    const empty = findEmptyCell(grid);
    if (!empty) break; // Solved!
    
    const candidates = getCandidates(grid, empty.row, empty.col);
    if (candidates.length === 0) {
      // Invalid state - shouldn't happen with valid puzzles
      break;
    }
    
    // Use first candidate (this is simplified - real backtracking would try all)
    const value = candidates[0];
    grid[empty.row][empty.col] = value;
    steps.push({
      row: empty.row,
      col: empty.col,
      value,
      technique: "backtrack",
      description: `Trying ${value} in row ${empty.row + 1}, column ${empty.col + 1}`,
      candidates,
    });
  }
  
  return steps;
}

export function getTechniqueColor(technique: SolveStep["technique"]): string {
  switch (technique) {
    case "naked-single":
      return "hsl(186 100% 50%)"; // Cyan
    case "hidden-single":
      return "hsl(300 100% 60%)"; // Magenta
    case "elimination":
      return "hsl(45 100% 50%)"; // Yellow
    case "backtrack":
      return "hsl(150 100% 50%)"; // Green
    default:
      return "hsl(210 40% 98%)";
  }
}
