"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SHORTCUTS = [
  { key: "n", desc: "New task (focus quick add)" },
  { key: "e", desc: "Edit selected task" },
  { key: "f", desc: "Focus filter bar" },
  { key: "↑/↓", desc: "Navigate task list" },
  { key: "Enter", desc: "Open task detail" },
  { key: "Esc", desc: "Close panel / palette" },
  { key: "⌘K / Ctrl+K", desc: "Command palette" },
  { key: "?", desc: "Show this cheatsheet" },
];

interface ShortcutCheatsheetProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutCheatsheet({ open, onClose }: ShortcutCheatsheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded border border-border bg-surface p-4 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Keyboard shortcuts</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <dl className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex justify-between text-sm">
              <dt className="font-mono text-text-muted">{s.key}</dt>
              <dd className="text-text-primary">{s.desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

interface KeyboardShortcutsProps {
  onOpenPalette: () => void;
  onFocusFilter: () => void;
  onNewTask: () => void;
  selectedTaskId?: string | null;
  onOpenTask?: (id: string) => void;
}

export function useKeyboardShortcuts({
  onOpenPalette,
  onFocusFilter,
  onNewTask,
}: KeyboardShortcutsProps) {
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }

      if (typing) return;

      if (e.key === "?") {
        e.preventDefault();
        setCheatsheetOpen(true);
      }
      if (e.key === "f") {
        e.preventDefault();
        onFocusFilter();
      }
      if (e.key === "n") {
        e.preventDefault();
        onNewTask();
      }
      if (e.key === "Escape") {
        setCheatsheetOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenPalette, onFocusFilter, onNewTask]);

  return {
    cheatsheetOpen,
    closeCheatsheet: () => setCheatsheetOpen(false),
    Cheatsheet: () => (
      <ShortcutCheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
    ),
  };
}
