"use client";

import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/loading-messages";

export function LoadingScreen({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-5 px-6 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-1 w-36 overflow-hidden rounded-full bg-raised">
        <div className="h-full w-1/3 rounded-full bg-accent animate-loading-slide" />
      </div>
      <p className="max-w-xs text-center text-sm text-text-muted transition-opacity duration-300">
        {LOADING_MESSAGES[index]}
      </p>
    </div>
  );
}
