"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api, type TaskDTO } from "@/lib/api";
import { useProjects } from "@/components/providers/AppDataProvider";
import { parseQuickAdd } from "@/lib/parse-quick-add";
import { format } from "date-fns";

interface QuickAddProps {
  onCreated: (task: TaskDTO) => void;
  defaultStatus?: string;
  placeholder?: string;
  projectId?: string;
}

export function QuickAdd({
  onCreated,
  defaultStatus = "inbox",
  placeholder = "Add a task...",
  projectId: defaultProjectId,
}: QuickAddProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { projects } = useProjects();

  const parsed = input.trim() ? parseQuickAdd(input) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const p = parseQuickAdd(input);
    setLoading(true);

    const projectId =
      defaultProjectId ||
      (p.projectSlug
        ? projects.find((proj) => proj.slug === p.projectSlug)?.id
        : undefined);

    const { data, error } = await api.tasks.create({
      title: p.title,
      status: defaultStatus as TaskDTO["status"],
      priority: (p.priority || "none") as TaskDTO["priority"],
      projectId,
      dueDate: p.dueDate?.toISOString(),
      labelIds: [],
    });

    setLoading(false);
    if (data) {
      setInput("");
      onCreated(data);
    } else if (error) {
      console.error(error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <Input
          data-quick-add
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="submit" variant="primary" size="sm" disabled={loading || !input.trim()}>
          <Plus size={16} />
        </Button>
      </div>
      {parsed && parsed.tokens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {parsed.tokens.map((t) => (
            <Badge key={`${t.type}-${t.value}`} variant="accent">
              {t.value}
            </Badge>
          ))}
          {parsed.dueDate && (
            <Badge variant="default">{format(parsed.dueDate, "MMM d")}</Badge>
          )}
        </div>
      )}
    </form>
  );
}
