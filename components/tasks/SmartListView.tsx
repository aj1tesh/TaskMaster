"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type TaskDTO } from "@/lib/api";
import { useSmartLists } from "@/components/providers/AppDataProvider";
import { TaskRow } from "@/components/tasks/TaskRow";
import { FilterBar, type TaskFilters } from "@/components/tasks/FilterBar";
import { useTaskPanel } from "@/components/tasks/TaskPanelContext";

interface SmartListViewProps {
  listId: string;
}

export function SmartListView({ listId }: SmartListViewProps) {
  const { smartLists } = useSmartLists();
  const [list, setList] = useState<(typeof smartLists)[number] | null>(null);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const { openTask } = useTaskPanel();

  const load = useCallback(async (f: TaskFilters) => {
    const params: Record<string, string> = {};
    if (f.projectId) params.projectId = f.projectId;
    if (f.status) params.status = f.status;
    if (f.priority) params.priority = f.priority;
    if (f.labelId) params.labelId = f.labelId;
    if (f.dueFrom) params.dueFrom = f.dueFrom;
    if (f.dueTo) params.dueTo = f.dueTo;
    const { data } = await api.tasks.list(params);
    if (data) setTasks(data);
  }, []);

  useEffect(() => {
    const found = smartLists.find((l) => l.id === listId);
    if (found) {
      setList(found);
      setFilters(found.filters);
      load(found.filters);
    }
  }, [listId, smartLists, load]);

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const resolvedStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: resolvedStatus } : t))
    );
    const { error } = await api.tasks.update(id, { status: resolvedStatus });
    if (error) load(filters);
  }

  return (
    <div>
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-medium text-text-primary">{list?.name || "Smart List"}</h1>
      </header>

      <FilterBar filters={filters} onChange={(f) => { setFilters(f); load(f); }} />

      {tasks.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-muted">No tasks match this list.</p>
      ) : (
        tasks.map((task) => (
          <TaskRow key={task.id} task={task} onClick={openTask} onToggle={handleToggle} />
        ))
      )}
    </div>
  );
}
