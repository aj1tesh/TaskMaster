import { ApiResponse } from "@/lib/api-helpers";
import type { TaskStatus, TaskPriority, SerializedRecurrence } from "@/lib/types";

export type { TaskStatus, TaskPriority, SerializedRecurrence };

export interface TaskDTO {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  parentTaskId?: string;
  labelIds: string[];
  dueDate?: string;
  reminderAt?: string;
  recurrence?: SerializedRecurrence;
  order: number;
  timeEstimateMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  isArchived: boolean;
  order: number;
}

export interface LabelDTO {
  id: string;
  name: string;
  colorHex: string;
}

export interface SmartListDTO {
  id: string;
  name: string;
  filters: Record<string, string>;
}

export interface ReportsDTO {
  timeByProject: { name: string; minutes: number; hours: number }[];
  completedThisWeek: number;
  streakDays: number;
  totalMinutes: number;
}

export interface BootstrapDTO {
  projects: ProjectDTO[];
  labels: LabelDTO[];
  smartLists: SmartListDTO[];
  timer: { taskId: string; taskTitle?: string; startedAt: string } | null;
}

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { data: ApiResponse<unknown>; ts: number }>();
const inflight = new Map<string, Promise<ApiResponse<unknown>>>();

export function clearApiCache(urlPrefix?: string) {
  if (!urlPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(urlPrefix)) cache.delete(key);
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const method = (options?.method ?? "GET").toUpperCase();
  const key = `${method}:${url}`;

  if (method === "GET") {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
      return hit.data as ApiResponse<T>;
    }
    const pending = inflight.get(key);
    if (pending) return pending as Promise<ApiResponse<T>>;
  } else {
    clearApiCache(url.split("?")[0]);
  }

  const promise = fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
    .then(async (res) => {
      const text = await res.text();
      if (!text) {
        return {
          data: null,
          error: res.ok ? null : `Request failed (${res.status})`,
        } satisfies ApiResponse<T>;
      }
      try {
        return JSON.parse(text) as ApiResponse<T>;
      } catch {
        return {
          data: null,
          error: `Invalid server response (${res.status})`,
        } satisfies ApiResponse<T>;
      }
    })
    .then((json) => {
      if (method === "GET") {
        cache.set(key, { data: json, ts: Date.now() });
      }
      return json;
    })
    .finally(() => {
      inflight.delete(key);
    });

  if (method === "GET") inflight.set(key, promise);
  return promise;
}

export const api = {
  tasks: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return request<TaskDTO[]>(`/api/tasks${qs}`);
    },
    get: (id: string) => request<TaskDTO>(`/api/tasks/${id}`),
    create: (data: Partial<TaskDTO>) =>
      request<TaskDTO>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<TaskDTO>) =>
      request<TaskDTO>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ id: string }>(`/api/tasks/${id}`, { method: "DELETE" }),
    bulk: (data: { ids: string[]; updates: Partial<TaskDTO> }) =>
      request<TaskDTO[]>("/api/tasks/bulk", { method: "PATCH", body: JSON.stringify(data) }),
    timer: (id: string) =>
      request<{ sessions: { id: string; startedAt: string; durationMinutes?: number }[]; totalMinutes: number }>(
        `/api/tasks/${id}/timer`
      ),
  },
  projects: {
    list: () => request<ProjectDTO[]>("/api/projects"),
    create: (data: { name: string; colorHex?: string; slug?: string }) =>
      request<ProjectDTO>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  labels: {
    list: () => request<LabelDTO[]>("/api/labels"),
    create: (data: { name: string; colorHex?: string }) =>
      request<LabelDTO>("/api/labels", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<LabelDTO>) =>
      request<LabelDTO>(`/api/labels/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ id: string }>(`/api/labels/${id}`, { method: "DELETE" }),
  },
  smartLists: {
    list: () => request<SmartListDTO[]>("/api/smart-lists"),
    create: (data: { name: string; filters: Record<string, string> }) =>
      request<SmartListDTO>("/api/smart-lists", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<SmartListDTO>("/api/smart-lists", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  reports: () => request<ReportsDTO>("/api/reports"),
  bootstrap: () => request<BootstrapDTO>("/api/bootstrap"),
  timer: {
    get: () => request<{ taskId: string; taskTitle?: string; startedAt: string } | null>("/api/timer"),
    start: (taskId: string) =>
      request<unknown>("/api/timer", { method: "POST", body: JSON.stringify({ action: "start", taskId }) }),
    stop: (taskId?: string) =>
      request<unknown>("/api/timer", { method: "POST", body: JSON.stringify({ action: "stop", taskId }) }),
  },
};
