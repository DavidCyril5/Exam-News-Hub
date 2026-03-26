import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AccentColor = "gold" | "blue" | "green" | "purple" | "red";
export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentColor;
  toggleMode: () => void;
  setAccent: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const ACCENT_COLORS: Record<AccentColor, { primary: string; ring: string; label: string; swatch: string }> = {
  gold:   { primary: "43 74% 49%",  ring: "43 74% 49%",  label: "Gold",   swatch: "#C9962D" },
  blue:   { primary: "217 91% 60%", ring: "217 91% 60%", label: "Blue",   swatch: "#3B82F6" },
  green:  { primary: "142 71% 40%", ring: "142 71% 40%", label: "Green",  swatch: "#22C55E" },
  purple: { primary: "262 83% 58%", ring: "262 83% 58%", label: "Purple", swatch: "#A855F7" },
  red:    { primary: "0 84% 55%",   ring: "0 84% 55%",   label: "Red",    swatch: "#EF4444" },
};

function applyTheme(mode: ThemeMode, accent: AccentColor) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  const c = ACCENT_COLORS[accent];
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--ring", c.ring);
  root.style.setProperty("--accent", c.primary);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("examcore_theme_mode");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem("examcore_theme_accent");
    if (stored && stored in ACCENT_COLORS) return stored as AccentColor;
    return "gold";
  });

  useEffect(() => {
    applyTheme(mode, accent);
    localStorage.setItem("examcore_theme_mode", mode);
    localStorage.setItem("examcore_theme_accent", accent);
  }, [mode, accent]);

  const toggleMode = () => setMode(m => m === "light" ? "dark" : "light");
  const setAccent = (color: AccentColor) => setAccentState(color);

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export { ACCENT_COLORS };
