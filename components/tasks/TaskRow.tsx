"use client";

import { Circle, CheckCircle2, Play } from "lucide-react";
import type { TaskDTO } from "@/lib/api";
import { api } from "@/lib/api";
import { useActiveTimer } from "@/components/providers/AppDataProvider";
import { format, isBefore, startOfDay } from "date-fns";

interface TaskRowProps {
  task: TaskDTO;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onToggle?: (id: string) => void;
  onClick?: (id: string) => void;
  showDueDate?: boolean;
  showTimer?: boolean;
}

const priorityDots: Record<string, string> = {
  urgent: "bg-accent",
  high: "bg-text-muted",
  medium: "bg-text-muted/60",
  low: "bg-text-muted/40",
};

export function TaskRow({
  task,
  selected,
  onSelect,
  onToggle,
  onClick,
  showDueDate = true,
  showTimer = true,
}: TaskRowProps) {
  const { refreshTimer } = useActiveTimer();
  const isDone = task.status === "done";
  const isOverdue =
    task.dueDate &&
    isBefore(new Date(task.dueDate), startOfDay(new Date())) &&
    !isDone;

  return (
    <div
      className={`group flex min-h-[44px] items-center gap-3 border-b border-border px-4 py-2 hover:bg-raised ${
        selected ? "bg-raised" : ""
      }`}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(task.id)}
          className="h-4 w-4 shrink-0 accent-accent"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <button
        onClick={() => onToggle?.(task.id)}
        className="shrink-0 text-text-muted hover:text-text-primary"
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      >
        {isDone ? (
          <CheckCircle2 size={18} className="text-text-muted" />
        ) : (
          <Circle size={18} />
        )}
      </button>

      {task.priority !== "none" && task.priority !== "low" && (
        <span
          className={`h-2 w-2 shrink-0 rounded-sm ${priorityDots[task.priority] || ""}`}
          title={task.priority}
        />
      )}

      <button
        onClick={() => onClick?.(task.id)}
        className={`flex-1 text-left text-sm ${
          isDone ? "text-text-muted line-through" : "text-text-primary"
        }`}
      >
        {task.title}
      </button>

      {showDueDate && task.dueDate && (
        <span
          className={`shrink-0 font-mono text-xs ${
            isOverdue ? "text-accent" : "text-text-muted"
          }`}
        >
          {format(new Date(task.dueDate), "MMM d")}
        </span>
      )}

      {showTimer && !isDone && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            api.timer.start(task.id).then(() => refreshTimer());
          }}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-text-muted opacity-0 hover:text-text-primary group-hover:opacity-100"
          aria-label="Start timer"
        >
          <Play size={14} />
        </button>
      )}
    </div>
  );
}
