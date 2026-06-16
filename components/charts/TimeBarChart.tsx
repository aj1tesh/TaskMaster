"use client";

import { useEffect, useState } from "react";
import { api, type ReportsDTO } from "@/lib/api";

function TimeBarChart({
  data,
}: {
  data: { name: string; hours: number }[];
}) {
  const maxHours = Math.max(...data.map((d) => d.hours), 0.1);

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((item) => {
        const heightPct = Math.max((item.hours / maxHours) * 100, item.hours > 0 ? 4 : 0);
        return (
          <div
            key={item.name}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${item.name}: ${item.hours}h`}
          >
            <span className="font-mono text-[10px] text-text-muted">
              {item.hours > 0 ? `${item.hours}h` : ""}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-accent transition-all"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] text-text-muted">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ReportsView() {
  const [data, setData] = useState<ReportsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports().then(({ data }) => {
      if (data) setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 animate-pulse-flat rounded" />
        <div className="h-64 animate-pulse-flat rounded" />
      </div>
    );
  }

  if (!data) return <p className="p-6 text-sm text-text-muted">No report data.</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-lg font-medium text-text-primary">Reports</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded border border-border p-4">
          <p className="text-xs text-text-muted">Completed this week</p>
          <p className="text-2xl font-medium text-text-primary">{data.completedThisWeek}</p>
        </div>
        <div className="rounded border border-border p-4">
          <p className="text-xs text-text-muted">Streak</p>
          <p className="text-2xl font-medium text-text-primary">{data.streakDays} days</p>
        </div>
        <div className="rounded border border-border p-4">
          <p className="text-xs text-text-muted">Time logged</p>
          <p className="text-2xl font-medium font-mono text-text-primary">
            {Math.floor(data.totalMinutes / 60)}h {data.totalMinutes % 60}m
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-medium text-text-muted">Time by project (this week)</h2>
        {data.timeByProject.length === 0 ? (
          <p className="text-sm text-text-muted">No time logged yet.</p>
        ) : (
          <div className="rounded border border-border p-4">
            <TimeBarChart data={data.timeByProject} />
          </div>
        )}
      </section>
    </div>
  );
}
