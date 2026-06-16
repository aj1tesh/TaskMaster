"use client";

import { useEffect, useState } from "react";
import { api, type TaskDTO } from "@/lib/api";
import { TaskRow } from "./TaskRow";
import { Plus } from "lucide-react";

interface SubtaskListProps {
  parentTaskId: string;
}

export function SubtaskList({ parentTaskId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<TaskDTO[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    api.tasks.list({ parentTaskId }).then(({ data }) => {
      if (data) setSubtasks(data);
    });
  }, [parentTaskId]);

  async function addSubtask() {
    if (!newTitle.trim()) return;
    const { data } = await api.tasks.create({
      title: newTitle.trim(),
      parentTaskId,
      status: "todo",
    });
    if (data) {
      setSubtasks((prev) => [...prev, data]);
      setNewTitle("");
    }
  }

  async function toggle(id: string) {
    const task = subtasks.find((t) => t.id === id);
    if (!task) return;
    const status = task.status === "done" ? "todo" : "done";
    const { data } = await api.tasks.update(id, { status });
    if (data) setSubtasks((prev) => prev.map((t) => (t.id === id ? data : t)));
  }

  return (
    <div>
      <p className="mb-2 text-xs text-text-muted">Subtasks</p>
      {subtasks.map((task) => (
        <TaskRow key={task.id} task={task} onToggle={toggle} showDueDate={false} />
      ))}
      <div className="flex items-center gap-2 px-4 py-2">
        <Plus size={14} className="text-text-muted" />
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSubtask()}
          placeholder="Add subtask"
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
