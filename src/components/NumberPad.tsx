import { motion } from "framer-motion";
import { Eraser, Lightbulb, RotateCcw, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
  onHint: () => void;
  onUndo: () => void;
  notesMode: boolean;
  onToggleNotes: () => void;
  numberCounts: Record<number, number>;
  disabled: boolean;
}

export function NumberPad({
  onNumberClick,
  onErase,
  onHint,
  onUndo,
  notesMode,
  onToggleNotes,
  numberCounts,
  disabled,
}: NumberPadProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-[500px] mx-auto mt-6"
    >
      {/* Number buttons */}
      <div className="grid grid-cols-9 gap-1 sm:gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isComplete = numberCounts[num] >= 9;
          return (
            <motion.button
              key={num}
              onClick={() => !isComplete && onNumberClick(num)}
              disabled={disabled || isComplete}
              whileHover={!isComplete && !disabled ? { scale: 1.1 } : {}}
              whileTap={!isComplete && !disabled ? { scale: 0.95 } : {}}
              className={cn(
                "aspect-square rounded-lg font-orbitron text-lg sm:text-xl md:text-2xl font-bold",
                "transition-all duration-200",
                "border border-border",
                isComplete
                  ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
                  : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground hover:box-glow-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {num}
              {!isComplete && (
                <span className="block text-[10px] sm:text-xs font-rajdhani text-muted-foreground">
                  {9 - numberCounts[num]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <ActionButton
          onClick={onUndo}
          disabled={disabled}
          icon={<RotateCcw className="w-5 h-5" />}
          label="Undo"
        />
        <ActionButton
          onClick={onErase}
          disabled={disabled}
          icon={<Eraser className="w-5 h-5" />}
          label="Erase"
        />
        <ActionButton
          onClick={onToggleNotes}
          disabled={disabled}
          icon={<PenLine className="w-5 h-5" />}
          label="Notes"
          active={notesMode}
        />
        <ActionButton
          onClick={onHint}
          disabled={disabled}
          icon={<Lightbulb className="w-5 h-5" />}
          label="Hint"
          variant="accent"
        />
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  variant?: "default" | "accent";
}

function ActionButton({ onClick, disabled, icon, label, active, variant = "default" }: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-3 rounded-lg",
        "font-rajdhani text-sm font-medium",
        "transition-all duration-200 border border-border",
        variant === "accent"
          ? "bg-warning/10 text-warning hover:bg-warning/20 hover:box-glow-accent border-warning/30"
          : active
            ? "bg-primary text-primary-foreground box-glow-primary"
            : "bg-secondary text-foreground hover:bg-primary/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </motion.button>
  );
}
