"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  api,
  clearApiCache,
  type BootstrapDTO,
  type LabelDTO,
  type ProjectDTO,
  type SmartListDTO,
} from "@/lib/api";

interface TimerState {
  taskId: string;
  taskTitle?: string;
  startedAt: string;
}

interface AppDataContextValue {
  projects: ProjectDTO[];
  labels: LabelDTO[];
  smartLists: SmartListDTO[];
  timer: TimerState | null;
  ready: boolean;
  refreshProjects: () => Promise<void>;
  refreshLabels: () => Promise<void>;
  refreshSmartLists: () => Promise<void>;
  refreshTimer: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function applyBootstrap(
  data: BootstrapDTO,
  setters: {
    setProjects: (v: ProjectDTO[]) => void;
    setLabels: (v: LabelDTO[]) => void;
    setSmartLists: (v: SmartListDTO[]) => void;
    setTimer: (v: TimerState | null) => void;
  }
) {
  setters.setProjects(data.projects);
  setters.setLabels(data.labels);
  setters.setSmartLists(data.smartLists);
  setters.setTimer(data.timer);
}

export function AppDataProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: BootstrapDTO;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [projects, setProjects] = useState<ProjectDTO[]>(initial?.projects ?? []);
  const [labels, setLabels] = useState<LabelDTO[]>(initial?.labels ?? []);
  const [smartLists, setSmartLists] = useState<SmartListDTO[]>(initial?.smartLists ?? []);
  const [timer, setTimer] = useState<TimerState | null>(initial?.timer ?? null);
  const [ready, setReady] = useState(!!initial);

  const refreshAll = useCallback(async () => {
    clearApiCache("/api/bootstrap");
    const { data } = await api.bootstrap();
    if (data) {
      applyBootstrap(data, { setProjects, setLabels, setSmartLists, setTimer });
    }
    setReady(true);
  }, []);

  const refreshProjects = useCallback(async () => {
    clearApiCache("/api/projects");
    const { data } = await api.projects.list();
    if (data) setProjects(data);
  }, []);

  const refreshLabels = useCallback(async () => {
    clearApiCache("/api/labels");
    const { data } = await api.labels.list();
    if (data) setLabels(data);
  }, []);

  const refreshSmartLists = useCallback(async () => {
    clearApiCache("/api/smart-lists");
    const { data } = await api.smartLists.list();
    if (data) setSmartLists(data);
  }, []);

  const refreshTimer = useCallback(async () => {
    clearApiCache("/api/timer");
    const { data } = await api.timer.get();
    setTimer(data ?? null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || initial) return;

    let cancelled = false;

    (async () => {
      const { data } = await api.bootstrap();
      if (cancelled) return;
      if (data) {
        applyBootstrap(data, { setProjects, setLabels, setSmartLists, setTimer });
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [initial, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !ready) return;
    const id = setInterval(() => {
      refreshTimer();
    }, 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated, ready, refreshTimer]);

  return (
    <AppDataContext.Provider
      value={{
        projects,
        labels,
        smartLists,
        timer,
        ready,
        refreshProjects,
        refreshLabels,
        refreshSmartLists,
        refreshTimer,
        refreshAll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}

export function useProjects() {
  const { projects, ready, refreshProjects } = useAppData();
  return { projects, ready, refreshProjects };
}

export function useLabels() {
  const { labels, ready, refreshLabels } = useAppData();
  return { labels, ready, refreshLabels };
}

export function useSmartLists() {
  const { smartLists, ready, refreshSmartLists } = useAppData();
  return { smartLists, ready, refreshSmartLists };
}

export function useActiveTimer() {
  const { timer, refreshTimer } = useAppData();
  return { timer, refreshTimer };
}
