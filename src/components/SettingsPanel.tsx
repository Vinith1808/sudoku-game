import { motion } from "framer-motion";
import { X, Volume2, VolumeX, Music, Moon, Sun, Palette, Eye } from "lucide-react";
import { useTheme, COLOR_PRESETS } from "@/hooks/useTheme";
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
  const { theme, toggleTheme, colorPreset, setColorPreset, highContrast, toggleHighContrast } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm bg-card rounded-2xl p-6 border border-border shadow-xl"
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

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                "relative w-14 h-7 rounded-full transition-all duration-300",
                theme === "dark" ? "bg-primary/30" : "bg-warning/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full shadow-lg",
                  theme === "dark" ? "bg-primary" : "bg-warning"
                )}
                animate={{ left: theme === "dark" ? "4px" : "32px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* Color Preset */}
          <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <span className="font-rajdhani">Color Theme</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => setColorPreset(preset.id)}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all duration-300 font-rajdhani text-sm",
                    colorPreset === preset.id
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${preset.colors.primary} 80% 50%), hsl(${preset.colors.accent} 80% 50%))` 
                      }}
                    />
                    {preset.name}
                  </div>
                  {colorPreset === preset.id && (
                    <motion.div
                      layoutId="activePreset"
                      className="absolute inset-0 rounded-lg border-2 border-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className={cn("w-5 h-5", highContrast ? "text-success" : "text-muted-foreground")} />
              <div>
                <span className="font-rajdhani block">High Contrast</span>
                <span className="text-xs text-muted-foreground">Accessibility mode</span>
              </div>
            </div>
            <motion.button
              onClick={toggleHighContrast}
              className={cn(
                "relative w-14 h-7 rounded-full transition-all duration-300",
                highContrast ? "bg-success/30" : "bg-muted"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full shadow-lg",
                  highContrast ? "bg-success" : "bg-muted-foreground"
                )}
                animate={{ left: highContrast ? "32px" : "4px" }}
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
                "relative w-14 h-7 rounded-full transition-all duration-300",
                soundEnabled ? "bg-primary/30" : "bg-muted"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full shadow-lg",
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
                "relative w-14 h-7 rounded-full transition-all duration-300",
                musicEnabled ? "bg-accent/30" : "bg-muted"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full shadow-lg",
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
