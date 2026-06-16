export type TaskStatus =
  | "inbox"
  | "todo"
  | "in_progress"
  | "done"
  | "blocked"
  | "cancelled";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface SerializedRecurrence {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endsAt?: string;
}
