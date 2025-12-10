import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, RotateCcw, FastForward, X } from "lucide-react";
import { generateSolveSteps, getTechniqueColor, type SolveStep } from "@/lib/sudokuSolver";
import type { Board } from "@/lib/sudoku";
import { cn } from "@/lib/utils";

interface AISolverProps {
  initialBoard: Board;
  onClose: () => void;
}

export function AISolver({ initialBoard, onClose }: AISolverProps) {
  const [steps, setSteps] = useState<SolveStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [displayBoard, setDisplayBoard] = useState<(number | null)[][]>([]);

  // Convert board to grid
  useEffect(() => {
    const grid = initialBoard.map(row => row.map(cell => cell.value ?? 0));
    const solveSteps = generateSolveSteps(grid);
    setSteps(solveSteps);
    
    // Initialize display board with preset values
    setDisplayBoard(initialBoard.map(row => row.map(cell => cell.isPreset ? cell.value : null)));
    setCurrentStep(-1);
  }, [initialBoard]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      goToStep(currentStep + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < -1 || stepIndex >= steps.length) return;

    // Rebuild board up to this step
    const newBoard = initialBoard.map(row => 
      row.map(cell => cell.isPreset ? cell.value : null)
    );

    for (let i = 0; i <= stepIndex; i++) {
      const step = steps[i];
      newBoard[step.row][step.col] = step.value;
    }

    setDisplayBoard(newBoard);
    setCurrentStep(stepIndex);
  }, [initialBoard, steps]);

  const reset = () => {
    setIsPlaying(false);
    goToStep(-1);
  };

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-4xl bg-card rounded-2xl p-6 border border-border"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="font-orbitron text-2xl text-primary text-glow-primary mb-6 text-center">
          AI SOLVER VISUALIZATION
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mini board */}
          <div className="space-y-4">
            <div className="grid grid-cols-9 gap-0 bg-card border-2 border-primary/30 rounded-lg overflow-hidden">
              {displayBoard.map((row, rowIndex) =>
                row.map((value, colIndex) => {
                  const isCurrentStep = currentStepData?.row === rowIndex && currentStepData?.col === colIndex;
                  const stepAtCell = steps.findIndex(s => s.row === rowIndex && s.col === colIndex);
                  const techniqueColor = stepAtCell >= 0 && stepAtCell <= currentStep 
                    ? getTechniqueColor(steps[stepAtCell].technique)
                    : undefined;
                  const isPreset = initialBoard[rowIndex][colIndex].isPreset;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "aspect-square flex items-center justify-center text-sm font-semibold",
                        "border-r border-b border-grid-line",
                        colIndex === 2 || colIndex === 5 ? "border-r-2 border-r-grid-line-thick" : "",
                        rowIndex === 2 || rowIndex === 5 ? "border-b-2 border-b-grid-line-thick" : "",
                        colIndex === 0 && "border-l-2 border-l-grid-line-thick",
                        rowIndex === 0 && "border-t-2 border-t-grid-line-thick",
                        colIndex === 8 && "border-r-2 border-r-grid-line-thick",
                        rowIndex === 8 && "border-b-2 border-b-grid-line-thick",
                        isPreset ? "text-cell-preset bg-secondary/30" : "text-foreground",
                        isCurrentStep && "ring-2 ring-primary"
                      )}
                      style={{
                        backgroundColor: !isPreset && value !== null && techniqueColor 
                          ? `${techniqueColor.replace(')', ' / 0.2)')}` 
                          : undefined,
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {value !== null && (
                          <motion.span
                            key={`${rowIndex}-${colIndex}-${value}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={isPreset ? "" : "font-bold"}
                            style={{ color: !isPreset && techniqueColor ? techniqueColor : undefined }}
                          >
                            {value}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100 || 0)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls and info */}
          <div className="space-y-4">
            {/* Current step info */}
            <div className="bg-secondary/50 rounded-lg p-4 min-h-[100px]">
              {currentStepData ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-orbitron uppercase"
                      style={{
                        backgroundColor: `${getTechniqueColor(currentStepData.technique).replace(')', ' / 0.2)')}`,
                        color: getTechniqueColor(currentStepData.technique),
                      }}
                    >
                      {currentStepData.technique.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-foreground font-rajdhani">{currentStepData.description}</p>
                  <p className="text-muted-foreground text-sm">
                    Placed <span className="text-primary font-bold">{currentStepData.value}</span> at 
                    Row {currentStepData.row + 1}, Column {currentStepData.col + 1}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Press play to start the AI solver visualization
                </p>
              )}
            </div>

            {/* Technique legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { technique: "naked-single" as const, label: "Naked Single" },
                { technique: "hidden-single" as const, label: "Hidden Single" },
                { technique: "elimination" as const, label: "Elimination" },
                { technique: "backtrack" as const, label: "Backtracking" },
              ].map(({ technique, label }) => (
                <div key={technique} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTechniqueColor(technique) }}
                  />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Speed control */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Speed</label>
              <input
                type="range"
                min={50}
                max={1000}
                step={50}
                value={1050 - speed}
                onChange={(e) => setSpeed(1050 - Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep <= -1}
                className="p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <SkipForward className="w-5 h-5 rotate-180" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 rounded-full bg-primary text-primary-foreground hover:box-glow-primary"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToStep(currentStep + 1)}
                disabled={currentStep >= steps.length - 1}
                className="p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToStep(steps.length - 1)}
                disabled={currentStep >= steps.length - 1}
                className="p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50"
              >
                <FastForward className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
