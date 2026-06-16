"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeSlider() {
  const { themeLevel, setThemeLevel } = useTheme();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <Moon size={14} aria-hidden />
        <span className="font-mono">{themeLevel}%</span>
        <Sun size={14} aria-hidden />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={themeLevel}
        onChange={(e) => setThemeLevel(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-accent"
        aria-label="Theme brightness"
      />
    </div>
  );
}

export function ThemeToggle() {
  const { themeLevel, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-text-primary"
      aria-label={`Switch to ${themeLevel < 50 ? "light" : "dark"} mode`}
    >
      {themeLevel < 50 ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
