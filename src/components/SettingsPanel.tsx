import { motion } from "framer-motion";
import { X, Volume2, VolumeX, Music, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export function SettingsPanel({
  onClose,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
}: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-card rounded-2xl p-6 border border-border"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="font-orbitron text-xl text-primary text-glow-primary mb-6 text-center">
          SETTINGS
        </h2>

        <div className="space-y-4">
          {/* Theme toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-warning" />
              )}
              <span className="font-rajdhani">Theme</span>
            </div>
            <motion.button
              onClick={toggleTheme}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                theme === "dark" ? "bg-primary/30" : "bg-warning/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full",
                  theme === "dark" ? "bg-primary" : "bg-warning"
                )}
                animate={{ left: theme === "dark" ? "4px" : "32px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-rajdhani">Sound Effects</span>
            </div>
            <motion.button
              onClick={onToggleSound}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                soundEnabled ? "bg-primary/30" : "bg-muted"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full",
                  soundEnabled ? "bg-primary" : "bg-muted-foreground"
                )}
                animate={{ left: soundEnabled ? "32px" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* Music toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Music className={cn("w-5 h-5", musicEnabled ? "text-accent" : "text-muted-foreground")} />
              <span className="font-rajdhani">Ambient Music</span>
            </div>
            <motion.button
              onClick={onToggleMusic}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                musicEnabled ? "bg-accent/30" : "bg-muted"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full",
                  musicEnabled ? "bg-accent" : "bg-muted-foreground"
                )}
                animate={{ left: musicEnabled ? "32px" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
