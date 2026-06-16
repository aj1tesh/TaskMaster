"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import { MobileFab } from "./MobileFab";
import { NavigationLoader } from "./NavigationLoader";
import { useTheme } from "@/components/providers/ThemeProvider";

const CommandPalette = dynamic(
  () =>
    import("./CommandPalette").then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toggleTheme } = useTheme();

  useEffect(() => {
    function open() {
      setPaletteOpen(true);
    }
    window.addEventListener("open-command-palette", open);
    return () => window.removeEventListener("open-command-palette", open);
  }, []);

  const onFocusFilter = useCallback(() => {
    document.getElementById("filter-bar")?.focus();
  }, []);

  const onNewTask = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>("[data-quick-add]");
    input?.focus();
  }, []);

  const { Cheatsheet } = useKeyboardShortcuts({
    onOpenPalette: () => setPaletteOpen(true),
    onFocusFilter,
    onNewTask,
  });

  return (
    <>
      <NavigationLoader>{children}</NavigationLoader>
      {paletteOpen && (
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onToggleTheme={toggleTheme}
        />
      )}
      <Cheatsheet />
      <MobileFab onClick={onNewTask} />
    </>
  );
}
