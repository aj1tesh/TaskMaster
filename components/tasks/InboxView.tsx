"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type TaskDTO } from "@/lib/api";
import { useProjects, useSmartLists } from "@/components/providers/AppDataProvider";
import { TaskRow } from "./TaskRow";
import { QuickAdd } from "./QuickAdd";
import { Button } from "@/components/ui/Button";
import { Trash2, FolderPlus, Calendar } from "lucide-react";

import { useTaskPanel } from "./TaskPanelContext";

import { FilterBar, type TaskFilters } from "./FilterBar";

export function InboxView() {
  const { openTask } = useTaskPanel();
  const { projects } = useProjects();
  const { refreshSmartLists } = useSmartLists();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = useCallback(async () => {
    const params: Record<string, string> = { view: "inbox" };
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.labelId) params.labelId = filters.labelId;
    const { data } = await api.tasks.list(params);
    if (data) setTasks(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "inbox" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    const { data, error } = await api.tasks.update(id, { status: newStatus });
    if (error || !data) load();
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    setTasks((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
    await fetch("/api/tasks/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  async function bulkAssignProject(projectId: string) {
    const ids = Array.from(selected);
    setTasks((prev) =>
      prev.map((t) => (selected.has(t.id) ? { ...t, projectId } : t))
    );
    setSelected(new Set());
    await fetch("/api/tasks/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, updates: { projectId } }),
    });
    load();
  }

  async function bulkSetDueDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString();
    const ids = Array.from(selected);
    setTasks((prev) =>
      prev.map((t) => (selected.has(t.id) ? { ...t, dueDate } : t))
    );
    setSelected(new Set());
    await fetch("/api/tasks/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, updates: { dueDate } }),
    });
    load();
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
      <QuickAdd onCreated={(task) => setTasks((prev) => [task, ...prev])} />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onSaveSmartList={async (name, f) => {
          await api.smartLists.create({ name, filters: f as Record<string, string> });
          await refreshSmartLists();
        }}
      />

      {selected.size > 0 && (
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
          <span className="text-xs text-text-muted">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={() => setBulkOpen(!bulkOpen)}>
            <FolderPlus size={14} className="mr-1" /> Project
          </Button>
          {bulkOpen && (
            <div className="flex gap-1">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => bulkAssignProject(p.id)}
                  className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-raised"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <Button size="sm" variant="ghost" onClick={bulkSetDueDate}>
            <Calendar size={14} className="mr-1" /> Due date
          </Button>
          <Button size="sm" variant="ghost" onClick={bulkDelete}>
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="px-4 py-8 text-sm text-text-muted">Inbox is empty — capture something above.</p>
      ) : (
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            selected={selected.has(task.id)}
            onSelect={toggleSelect}
            onToggle={handleToggle}
            onClick={openTask}
            showDueDate={false}
          />
        ))
      )}
    </div>
  );
}
