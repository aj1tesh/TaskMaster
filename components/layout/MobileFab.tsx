"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

interface MobileFabProps {
  onClick: () => void;
}

export function MobileFab({ onClick }: MobileFabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded bg-accent text-white shadow-md md:hidden"
      aria-label="Add task"
    >
      <Plus size={24} />
    </button>
  );
}

export function useQuickAddFocus() {
  const ref = useRef<HTMLInputElement>(null);
  return {
    ref,
    focus: () => {
      ref.current?.focus();
      ref.current?.scrollIntoView({ behavior: "smooth" });
    },
  };
}
