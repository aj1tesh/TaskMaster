"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface TaskPanelContextValue {
  selectedTaskId: string | null;
  openTask: (id: string) => void;
  closeTask: () => void;
}

const TaskPanelContext = createContext<TaskPanelContextValue>({
  selectedTaskId: null,
  openTask: () => {},
  closeTask: () => {},
});

export function TaskPanelProvider({ children }: { children: React.ReactNode }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const openTask = useCallback((id: string) => setSelectedTaskId(id), []);
  const closeTask = useCallback(() => setSelectedTaskId(null), []);

  return (
    <TaskPanelContext.Provider value={{ selectedTaskId, openTask, closeTask }}>
      {children}
    </TaskPanelContext.Provider>
  );
}

export function useTaskPanel() {
  return useContext(TaskPanelContext);
}
