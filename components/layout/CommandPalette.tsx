"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { api, type TaskDTO, type ProjectDTO } from "@/lib/api";
import { startAppNavigation } from "@/lib/navigation-events";
import { useTaskPanel } from "@/components/tasks/TaskPanelContext";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onToggleTheme?: () => void;
}

export function CommandPalette({ open, onClose, onToggleTheme }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const { openTask } = useTaskPanel();

  const search = useCallback(async (q: string) => {
    const [tasksRes, projectsRes] = await Promise.all([
      q ? api.tasks.list({ q, limit: "8" }) : Promise.resolve({ data: [] }),
      api.projects.list(),
    ]);
    setTasks(tasksRes.data || []);
    const filtered = (projectsRes.data || []).filter((p) =>
      !q || p.name.toLowerCase().includes(q.toLowerCase())
    );
    setProjects(filtered.slice(0, 5));
    setSelected(0);
  }, []);

  useEffect(() => {
    if (open) search(query);
  }, [open, query, search]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      const total = tasks.length + projects.length + 2;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, total - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") executeSelected();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function executeSelected() {
    let idx = selected;
    if (idx < tasks.length) {
      openTask(tasks[idx].id);
      onClose();
      return;
    }
    idx -= tasks.length;
    if (idx < projects.length) {
      startAppNavigation();
      router.push(`/projects/${projects[idx].slug}`);
      onClose();
      return;
    }
    idx -= projects.length;
    if (idx === 0) {
      onToggleTheme?.();
      onClose();
    }
    if (idx === 1) {
      startAppNavigation();
      router.push("/settings");
      onClose();
    }
  }

  if (!open) return null;

  const actions = [
    { label: "Toggle theme" },
    { label: "Open settings" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh]">
      <div className="w-full max-w-lg rounded border border-border bg-surface shadow-md">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, actions..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {tasks.length > 0 && (
            <section>
              <p className="px-2 py-1 text-xs text-text-muted">Tasks</p>
              {tasks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { openTask(t.id); onClose(); }}
                  className={`flex w-full rounded px-2 py-2 text-left text-sm ${
                    selected === i ? "bg-raised text-text-primary" : "text-text-muted"
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </section>
          )}
          {projects.length > 0 && (
            <section>
              <p className="px-2 py-1 text-xs text-text-muted">Projects</p>
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    startAppNavigation();
                    router.push(`/projects/${p.slug}`);
                    onClose();
                  }}
                  className={`flex w-full rounded px-2 py-2 text-left text-sm ${
                    selected === tasks.length + i ? "bg-raised" : ""
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </section>
          )}
          <section>
            <p className="px-2 py-1 text-xs text-text-muted">Actions</p>
            {actions.map((a, i) => (
              <button
                key={a.label}
                onClick={executeSelected}
                className={`flex w-full rounded px-2 py-2 text-left text-sm ${
                  selected === tasks.length + projects.length + i ? "bg-raised" : ""
                }`}
              >
                {a.label}
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
