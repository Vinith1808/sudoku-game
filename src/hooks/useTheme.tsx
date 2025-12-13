import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "dark" | "light";
type ColorPreset = "default" | "cyberpunk" | "ocean" | "forest";

interface ThemeContextType {
  theme: Theme;
  colorPreset: ColorPreset;
  highContrast: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorPreset: (preset: ColorPreset) => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const COLOR_PRESETS: { id: ColorPreset; name: string; colors: { primary: string; accent: string } }[] = [
  { id: "default", name: "Default", colors: { primary: "186", accent: "300" } },
  { id: "cyberpunk", name: "Cyberpunk", colors: { primary: "320", accent: "45" } },
  { id: "ocean", name: "Ocean", colors: { primary: "200", accent: "170" } },
  { id: "forest", name: "Forest", colors: { primary: "140", accent: "35" } },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("sudoku_theme");
    return (saved as Theme) || "dark";
  });

  const [colorPreset, setColorPresetState] = useState<ColorPreset>(() => {
    const saved = localStorage.getItem("sudoku_color_preset");
    return (saved as ColorPreset) || "default";
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem("sudoku_high_contrast");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sudoku_theme", theme);
    localStorage.setItem("sudoku_color_preset", colorPreset);
    localStorage.setItem("sudoku_high_contrast", String(highContrast));
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "high-contrast", "preset-default", "preset-cyberpunk", "preset-ocean", "preset-forest");
    
    // Add current theme classes
    root.classList.add(theme);
    root.classList.add(`preset-${colorPreset}`);
    
    if (highContrast) {
      root.classList.add("high-contrast");
    }
    
    // Smooth transition for all theme changes
    root.style.setProperty("--theme-transition", "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)");
  }, [theme, colorPreset, highContrast]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === "dark" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setColorPreset = useCallback((preset: ColorPreset) => {
    setColorPresetState(preset);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorPreset, 
      highContrast, 
      toggleTheme, 
      setTheme, 
      setColorPreset, 
      toggleHighContrast 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
