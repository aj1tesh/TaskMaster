"use client";

import { useEffect, useState } from "react";
import { X, Play, Square } from "lucide-react";
import { useProjects, useLabels, useActiveTimer } from "@/components/providers/AppDataProvider";
import { api, type TaskDTO } from "@/lib/api";
import { useTaskPanel } from "./TaskPanelContext";
import { SubtaskList } from "./SubtaskList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatRecurrenceSummary } from "@/lib/parse-quick-add";

const priorities = ["none", "low", "medium", "high", "urgent"] as const;
const statuses = ["inbox", "todo", "in_progress", "done", "blocked", "cancelled"] as const;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TaskDetail() {
  const { selectedTaskId, closeTask } = useTaskPanel();
  const { projects } = useProjects();
  const { labels } = useLabels();
  const { timer, refreshTimer } = useActiveTimer();
  const [task, setTask] = useState<TaskDTO | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);

  const timerRunning = timer?.taskId === selectedTaskId;

  useEffect(() => {
    if (!selectedTaskId) {
      setTask(null);
      return;
    }

    (async () => {
      const [taskRes, timerRes] = await Promise.all([
        api.tasks.get(selectedTaskId),
        api.tasks.timer(selectedTaskId),
      ]);
      if (taskRes.data) {
        setTask(taskRes.data);
        setTitle(taskRes.data.title);
        setDescription(taskRes.data.description);
      }
      if (timerRes.data) setTotalMinutes(timerRes.data.totalMinutes);
    })();
  }, [selectedTaskId]);

  if (!selectedTaskId) return null;

  async function saveField(updates: Partial<TaskDTO>) {
    if (!task) return;
    const { data } = await api.tasks.update(task.id, updates);
    if (data) setTask(data);
  }

  async function toggleTimer() {
    if (!task) return;
    if (timerRunning) {
      await api.timer.stop(task.id);
      await refreshTimer();
      const { data } = await api.tasks.timer(task.id);
      if (data) setTotalMinutes(data.totalMinutes);
    } else {
      await api.timer.start(task.id);
      await refreshTimer();
    }
  }

  function toggleLabel(labelId: string) {
    if (!task) return;
    const ids = task.labelIds.includes(labelId)
      ? task.labelIds.filter((id) => id !== labelId)
      : [...task.labelIds, labelId];
    saveField({ labelIds: ids });
  }

  const estimateStr = task?.timeEstimateMinutes
    ? formatDuration(task.timeEstimateMinutes)
    : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 md:bg-transparent" onClick={closeTask} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-surface md:w-[400px]">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-mono text-xs text-text-muted">{task?.id.slice(-6)}</span>
          <button
            onClick={closeTask}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== task?.title && saveField({ title })}
            className="w-full bg-transparent text-lg font-medium text-text-primary focus:outline-none"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== task?.description && saveField({ description })}
            placeholder="Description (markdown, @project mentions)"
            rows={4}
            className="w-full resize-none rounded border border-border bg-raised p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={task?.status ?? "todo"}
              onValueChange={(v) => saveField({ status: v as TaskDTO["status"] })}
              options={statuses.map((s) => ({
                value: s,
                label: s.replace("_", " "),
              }))}
            />
            <Select
              label="Priority"
              value={task?.priority ?? "none"}
              onValueChange={(v) => saveField({ priority: v as TaskDTO["priority"] })}
              options={priorities.map((p) => ({ value: p, label: p }))}
            />
          </div>

          <Select
            label="Project"
            value={task?.projectId || ""}
            onValueChange={(v) => saveField({ projectId: v || undefined })}
            options={[
              { value: "", label: "No project" },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <div>
            <label className="mb-1 block text-xs text-text-muted">Labels</label>
            <div className="flex flex-wrap gap-1">
              {labels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => toggleLabel(l.id)}
                  className={`rounded-sm border px-2 py-1 text-xs ${
                    task?.labelIds.includes(l.id)
                      ? "border-accent text-accent"
                      : "border-border text-text-muted"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-text-muted">Due date</label>
              <Input
                type="datetime-local"
                value={task?.dueDate ? task.dueDate.slice(0, 16) : ""}
                onChange={(e) =>
                  saveField({
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Reminder</label>
              <Input
                type="datetime-local"
                value={task?.reminderAt ? task.reminderAt.slice(0, 16) : ""}
                onChange={(e) =>
                  saveField({
                    reminderAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="rounded border border-border p-3 space-y-2">
            <Select
              label="Recurrence"
              value={task?.recurrence?.freq || ""}
              onValueChange={(v) => {
                const freq = v as "daily" | "weekly" | "monthly" | "";
                if (!freq) saveField({ recurrence: undefined });
                else
                  saveField({
                    recurrence: {
                      freq,
                      interval: task?.recurrence?.interval || 1,
                      daysOfWeek: freq === "weekly" ? [1] : undefined,
                    },
                  });
              }}
              options={[
                { value: "", label: "None" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
            {task?.recurrence?.freq === "weekly" && (
              <div className="flex flex-wrap gap-1">
                {WEEKDAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = task.recurrence?.daysOfWeek || [];
                      const next = days.includes(i)
                        ? days.filter((d) => d !== i)
                        : [...days, i];
                      saveField({
                        recurrence: { ...task.recurrence!, daysOfWeek: next },
                      });
                    }}
                    className={`rounded-sm border px-2 py-0.5 text-xs ${
                      task.recurrence?.daysOfWeek?.includes(i)
                        ? "border-accent text-accent"
                        : "border-border text-text-muted"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
            {task?.recurrence && (
              <p className="text-xs text-text-muted">
                {formatRecurrenceSummary(task.recurrence)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 rounded border border-border p-3">
            <Button
              variant={timerRunning ? "primary" : "secondary"}
              size="sm"
              onClick={toggleTimer}
            >
              {timerRunning ? <Square size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
              {timerRunning ? "Stop" : "Start"}
            </Button>
            <span className="font-mono text-xs text-text-muted">
              {formatDuration(totalMinutes)}
              {estimateStr ? ` / ${estimateStr}` : ""}
            </span>
            {timerRunning && <Badge variant="accent">Running</Badge>}
          </div>

          {task && <SubtaskList parentTaskId={task.id} />}

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs text-text-muted">Activity</p>
            <div className="space-y-1 font-mono text-xs text-text-muted">
              {task?.createdAt && <p>Created {new Date(task.createdAt).toLocaleString()}</p>}
              {task?.completedAt && <p>Completed {new Date(task.completedAt).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
