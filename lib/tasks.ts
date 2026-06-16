import { ITask, IRecurrence } from "@/models/Task";

export function serializeTask(task: ITask | Record<string, unknown>) {
  const t = task as ITask & { _id: { toString(): string }; userId: { toString(): string } };
  return {
    id: t._id.toString(),
    userId: t.userId.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    projectId: t.projectId?.toString(),
    parentTaskId: t.parentTaskId?.toString(),
    labelIds: (t.labelIds || []).map((id: { toString(): string }) => id.toString()),
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
    reminderAt: t.reminderAt ? new Date(t.reminderAt).toISOString() : undefined,
    recurrence: t.recurrence
      ? {
          freq: t.recurrence.freq,
          interval: t.recurrence.interval,
          daysOfWeek: t.recurrence.daysOfWeek,
          endsAt: t.recurrence.endsAt
            ? new Date(t.recurrence.endsAt).toISOString()
            : undefined,
        }
      : undefined,
    order: t.order,
    timeEstimateMinutes: t.timeEstimateMinutes,
    completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
    createdAt: new Date(t.createdAt).toISOString(),
    updatedAt: new Date(t.updatedAt).toISOString(),
  };
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export type SerializedRecurrence = {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endsAt?: string;
};
