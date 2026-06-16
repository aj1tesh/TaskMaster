"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api, type TaskDTO } from "@/lib/api";
import { QuickAdd } from "./QuickAdd";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfDay,
  addDays,
} from "date-fns";

type DateGroup = "Today" | "Tomorrow" | "This week" | "Later" | "No date";

function getDateGroup(dueDate?: string): DateGroup {
  if (!dueDate) return "No date";
  const date = new Date(dueDate);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 0 })) return "This week";
  return "Later";
}

const groupOrder: DateGroup[] = ["Today", "Tomorrow", "This week", "Later", "No date"];

import { useTaskPanel } from "./TaskPanelContext";

const TaskList = dynamic(
  () => import("./TaskList").then((m) => ({ default: m.TaskList })),
  { ssr: false }
);

export function UpcomingView() {
  const { openTask } = useTaskPanel();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.tasks.list({ view: "upcoming", sort: "due" });
    if (data) setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = groupOrder.reduce(
    (acc, group) => {
      acc[group] = tasks.filter((t) => getDateGroup(t.dueDate) === group);
      return acc;
    },
    {} as Record<DateGroup, TaskDTO[]>
  );

  async function handleReorder(group: DateGroup, reordered: TaskDTO[]) {
    setTasks((prev) => {
      const other = prev.filter((t) => getDateGroup(t.dueDate) !== group);
      return [...other, ...reordered];
    });

    await Promise.all(
      reordered.map((task, index) =>
        api.tasks.update(task.id, { order: index })
      )
    );
  }

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
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
      <QuickAdd onCreated={() => load()} defaultStatus="todo" placeholder="Schedule a task..." />

      {tasks.length === 0 ? (
        <p className="px-4 py-8 text-sm text-text-muted">No upcoming tasks.</p>
      ) : (
        groupOrder.map((group) => {
          const groupTasks = grouped[group];
          if (groupTasks.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="sticky top-0 z-10 border-b border-border bg-base px-4 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {group}
              </h2>
              <TaskList
                tasks={groupTasks}
                onReorder={(reordered) => handleReorder(group, reordered)}
                onToggle={handleToggle}
                onClick={openTask}
              />
            </section>
          );
        })
      )}
    </div>
  );
}
