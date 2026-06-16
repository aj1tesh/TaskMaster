"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { PROJECT_COLORS } from "@/lib/projects";
import { ProjectDot } from "./ProjectDot";

interface CreateProjectFormProps {
  onCreated?: () => void;
  compact?: boolean;
}

export function CreateProjectForm({ onCreated, compact }: CreateProjectFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState<string>(PROJECT_COLORS[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    const { data, error: err } = await api.projects.create({
      name: name.trim(),
      colorHex,
    });
    setLoading(false);

    if (err || !data) {
      setError(err || "Could not create project");
      return;
    }

    setName("");
    setOpen(false);
    onCreated?.();
    router.push(`/projects/${data.slug}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 text-sm text-text-muted hover:text-text-primary ${
          compact
            ? "h-10 w-full rounded-none px-3 hover:bg-raised"
            : "min-h-[44px] rounded border border-border px-4 py-2 hover:bg-raised"
        }`}
      >
        <Plus size={16} />
        New project
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3 rounded border border-border bg-surface p-4 ${
        compact ? "mx-2 mb-2" : "mx-6 mb-4"
      }`}
    >
      <Input
        label="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Marketing"
        autoFocus
        required
      />

      <div>
        <p className="mb-2 text-xs text-text-muted">Color</p>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setColorHex(color)}
              className={`flex h-8 w-8 items-center justify-center rounded border ${
                colorHex === color ? "border-accent" : "border-border"
              }`}
              aria-label={`Color ${color}`}
            >
              <ProjectDot colorHex={color} size={12} />
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
