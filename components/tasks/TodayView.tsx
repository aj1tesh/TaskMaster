"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type TaskDTO } from "@/lib/api";
import { TaskRow } from "./TaskRow";
import { QuickAdd } from "./QuickAdd";
import { isBefore, startOfDay } from "date-fns";

import { useTaskPanel } from "./TaskPanelContext";

export function TodayView() {
  const { openTask } = useTaskPanel();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [completed, setCompleted] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [todayRes, completedRes] = await Promise.all([
      api.tasks.list({ view: "today", sort: "due" }),
      api.tasks.list({ view: "completed-today" }),
    ]);
    if (todayRes.data) setTasks(todayRes.data);
    if (completedRes.data) setCompleted(completedRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const overdue = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), startOfDay(new Date()))
  );
  const today = tasks.filter(
    (t) => !t.dueDate || !isBefore(new Date(t.dueDate), startOfDay(new Date()))
  );

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id) || completed.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    const updated: TaskDTO = {
      ...task,
      status: newStatus,
      completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
    };

    if (newStatus === "done") {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setCompleted((prev) => [updated, ...prev]);
    } else {
      setCompleted((prev) => prev.filter((t) => t.id !== id));
      setTasks((prev) => [...prev, updated]);
    }

    const { error } = await api.tasks.update(id, { status: newStatus });
    if (error) load();
  }

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-11 animate-pulse-flat rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <QuickAdd
        onCreated={() => load()}
        defaultStatus="todo"
        placeholder="Add task for today..."
      />

      {overdue.length > 0 && (
        <section>
          <h2 className="sticky top-0 z-10 border-b border-border bg-base px-4 py-2 text-xs font-medium uppercase tracking-wide text-accent">
            Overdue
          </h2>
          {overdue.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onClick={openTask} />
          ))}
        </section>
      )}

      <section>
        <h2 className="sticky top-0 z-10 border-b border-border bg-base px-4 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Today
        </h2>
        {today.length === 0 && overdue.length === 0 ? (
          <p className="px-4 py-8 text-sm text-text-muted">Nothing due today.</p>
        ) : (
          today.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onClick={openTask} />
          ))
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-8">
          <h2 className="sticky top-0 z-10 border-b border-border bg-base px-4 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Log completed
          </h2>
          {completed.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onClick={openTask} />
          ))}
        </section>
      )}
    </div>
  );
}
