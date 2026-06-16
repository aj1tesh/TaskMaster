"use client";

import { useState } from "react";
import { useLabels, useProjects } from "@/components/providers/AppDataProvider";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Bookmark } from "lucide-react";

export interface TaskFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  labelId?: string;
  dueFrom?: string;
  dueTo?: string;
}

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onSaveSmartList?: (name: string, filters: TaskFilters) => void;
}

const STATUS_OPTIONS = ["inbox", "todo", "in_progress", "done", "blocked", "cancelled"] as const;
const PRIORITY_OPTIONS = ["urgent", "high", "medium", "low", "none"] as const;

export function FilterBar({ filters, onChange, onSaveSmartList }: FilterBarProps) {
  const { projects } = useProjects();
  const { labels } = useLabels();
  const [saveName, setSaveName] = useState("");

  function update(key: keyof TaskFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div id="filter-bar" tabIndex={-1} className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 outline-none">
      <Select
        selectSize="sm"
        value={filters.projectId || ""}
        onValueChange={(v) => update("projectId", v)}
        options={[
          { value: "", label: "All projects" },
          ...projects.map((p) => ({ value: p.id, label: p.name })),
        ]}
        className="min-w-[9rem]"
        aria-label="Filter by project"
      />

      <Select
        selectSize="sm"
        value={filters.status || ""}
        onValueChange={(v) => update("status", v)}
        options={[
          { value: "", label: "All statuses" },
          ...STATUS_OPTIONS.map((s) => ({
            value: s,
            label: s.replace("_", " "),
          })),
        ]}
        className="min-w-[9rem]"
        aria-label="Filter by status"
      />

      <Select
        selectSize="sm"
        value={filters.priority || ""}
        onValueChange={(v) => update("priority", v)}
        options={[
          { value: "", label: "All priorities" },
          ...PRIORITY_OPTIONS.map((p) => ({ value: p, label: p })),
        ]}
        className="min-w-[9rem]"
        aria-label="Filter by priority"
      />

      <Select
        selectSize="sm"
        value={filters.labelId || ""}
        onValueChange={(v) => update("labelId", v)}
        options={[
          { value: "", label: "All labels" },
          ...labels.map((l) => ({ value: l.id, label: l.name })),
        ]}
        className="min-w-[9rem]"
        aria-label="Filter by label"
      />

      {onSaveSmartList && (
        <div className="ml-auto flex items-center gap-2">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Smart list name"
            className="h-8 w-32 rounded border border-border bg-raised px-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (saveName.trim()) {
                onSaveSmartList(saveName.trim(), filters);
                setSaveName("");
              }
            }}
          >
            <Bookmark size={14} />
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
