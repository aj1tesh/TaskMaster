"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  applyThemeLevel,
  legacyThemeFromLevel,
  themeLevelFromLegacy,
} from "@/lib/theme-colors";

interface ThemeContextValue {
  themeLevel: number;
  setThemeLevel: (level: number) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme = "dark",
  initialThemeLevel,
  children,
}: {
  initialTheme?: "dark" | "light";
  initialThemeLevel?: number;
  children: React.ReactNode;
}) {
  const startLevel =
    initialThemeLevel ?? themeLevelFromLegacy(initialTheme);
  const [themeLevel, setThemeLevelState] = useState(startLevel);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const level = initialThemeLevel ?? themeLevelFromLegacy(initialTheme);
    applyThemeLevel(level);
    setThemeLevelState(level);
  }, [initialTheme, initialThemeLevel]);

  const persistTheme = useCallback((level: number) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeLevel: level,
          theme: legacyThemeFromLevel(level),
        }),
      }).catch(() => {});
    }, 400);
  }, []);

  const setThemeLevel = useCallback(
    (level: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(level)));
      setThemeLevelState(clamped);
      applyThemeLevel(clamped);
      persistTheme(clamped);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    setThemeLevelState((current) => {
      const next = current < 50 ? 100 : 0;
      applyThemeLevel(next);
      persistTheme(next);
      return next;
    });
  }, [persistTheme]);

  return (
    <ThemeContext.Provider value={{ themeLevel, setThemeLevel, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
