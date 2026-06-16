"use client";

import { useEffect, useState } from "react";
import { useActiveTimer } from "@/components/providers/AppDataProvider";
import { api } from "@/lib/api";
import { Square } from "lucide-react";

export function TimerFooter() {
  const { timer, refreshTimer } = useActiveTimer();
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!timer) return;
    const tick = () => {
      const ms = Date.now() - new Date(timer.startedAt).getTime();
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setElapsed(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer]);

  if (!timer) return null;

  return (
    <div className="flex items-center gap-2 p-3">
      <span className="h-2 w-2 shrink-0 rounded-sm bg-accent" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-text-primary">{timer.taskTitle || "Timer"}</p>
        <p className="font-mono text-xs text-accent">{elapsed}</p>
      </div>
      <button
        onClick={() =>
          api.timer.stop(timer.taskId).then(() => refreshTimer())
        }
        className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-text-primary"
        aria-label="Stop timer"
      >
        <Square size={14} />
      </button>
    </div>
  );
}
