"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api, type TaskDTO } from "@/lib/api";
import { TaskRow } from "@/components/tasks/TaskRow";
import { QuickAdd } from "@/components/tasks/QuickAdd";
import { ProjectDot } from "@/components/projects/ProjectDot";
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTaskPanel } from "@/components/tasks/TaskPanelContext";

const STATUSES = ["todo", "in_progress", "done", "blocked"] as const;
const statusLabels: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

interface ProjectViewProps {
  projectId: string;
  projectName: string;
  colorHex: string;
}

const TaskList = dynamic(
  () => import("@/components/tasks/TaskList").then((m) => ({ default: m.TaskList })),
  { ssr: false }
);

export function ProjectView({ projectId, projectName, colorHex }: ProjectViewProps) {
  const { openTask } = useTaskPanel();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [view, setView] = useState<"list" | "board">("list");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await api.tasks.list({ projectId, sort: "order" });
    if (data) setTasks(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function handleReorder(reordered: TaskDTO[]) {
    setTasks(reordered);
    await Promise.all(
      reordered.map((task, index) => api.tasks.update(task.id, { order: index }))
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

  async function handleStatusChange(id: string, status: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: status as TaskDTO["status"] } : t))
    );
    await api.tasks.update(id, { status: status as TaskDTO["status"] });
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
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <ProjectDot colorHex={colorHex} size={10} />
          <h1 className="text-lg font-medium text-text-primary">{projectName}</h1>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === "list" ? "primary" : "ghost"}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List size={16} />
          </Button>
          <Button
            size="sm"
            variant={view === "board" ? "primary" : "ghost"}
            onClick={() => setView("board")}
            aria-label="Board view"
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
      </header>

      <QuickAdd
        onCreated={() => load()}
        defaultStatus="todo"
        placeholder={`Add to ${projectName}...`}
        projectId={projectId}
      />

      {view === "list" ? (
        tasks.length === 0 ? (
          <p className="px-4 py-8 text-sm text-text-muted">No tasks in this project.</p>
        ) : (
          <TaskList tasks={tasks} onReorder={handleReorder} onToggle={handleToggle} onClick={openTask} />
        )
      ) : (
        <div className="flex gap-4 overflow-x-auto p-4 md:grid md:grid-cols-4 md:overflow-visible">
          {STATUSES.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="min-w-[280px] shrink-0 rounded border border-border bg-surface md:min-w-0"
              >
                <h3 className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                  {statusLabels[status]} ({columnTasks.length})
                </h3>
                <div className="min-h-[100px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const taskId = e.dataTransfer.getData("taskId");
                        if (taskId) handleStatusChange(taskId, status);
                      }}
                    >
                      <TaskRow task={task} onToggle={handleToggle} onClick={openTask} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
