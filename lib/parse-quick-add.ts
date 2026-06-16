import { addDays, addWeeks, addMonths, nextMonday, startOfDay } from "date-fns";
import type { IRecurrence } from "@/models/Task";

export interface ParsedQuickAdd {
  title: string;
  projectSlug?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  tokens: { type: string; value: string }[];
}

const PRIORITY_MAP: Record<string, ParsedQuickAdd["priority"]> = {
  low: "low",
  medium: "medium",
  med: "medium",
  high: "high",
  urgent: "urgent",
};

const DATE_WORDS: Record<string, () => Date> = {
  today: () => startOfDay(new Date()),
  tomorrow: () => startOfDay(addDays(new Date(), 1)),
  monday: () => startOfDay(nextMonday(new Date())),
};

export function parseQuickAdd(input: string): ParsedQuickAdd {
  const tokens: ParsedQuickAdd["tokens"] = [];
  let title = input.trim();
  let projectSlug: string | undefined;
  let priority: ParsedQuickAdd["priority"];
  let dueDate: Date | undefined;

  const projectMatch = title.match(/#([\w-]+)/);
  if (projectMatch) {
    projectSlug = projectMatch[1].toLowerCase();
    tokens.push({ type: "project", value: `#${projectSlug}` });
    title = title.replace(projectMatch[0], "").trim();
  }

  const priorityMatch = title.match(/!(low|medium|med|high|urgent)/i);
  if (priorityMatch) {
    const key = priorityMatch[1].toLowerCase();
    priority = PRIORITY_MAP[key];
    tokens.push({ type: "priority", value: `!${key}` });
    title = title.replace(priorityMatch[0], "").trim();
  }

  for (const [word, fn] of Object.entries(DATE_WORDS)) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(title)) {
      dueDate = fn();
      tokens.push({ type: "due", value: word });
      title = title.replace(regex, "").trim();
      break;
    }
  }

  title = title.replace(/\s+/g, " ").trim();

  return { title, projectSlug, priority, dueDate, tokens };
}

export function formatRecurrenceSummary(r: {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endsAt?: Date | string;
}): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (r.freq === "daily") {
    return r.interval === 1 ? "Every day" : `Every ${r.interval} days`;
  }
  if (r.freq === "weekly") {
    if (r.daysOfWeek?.length) {
      const names = r.daysOfWeek.map((d) => days[d]).join(", ");
      return r.interval === 1 ? `Every ${names}` : `Every ${r.interval} weeks on ${names}`;
    }
    return r.interval === 1 ? "Every week" : `Every ${r.interval} weeks`;
  }
  if (r.freq === "monthly") {
    return r.interval === 1 ? "Every month" : `Every ${r.interval} months`;
  }
  return "Recurring";
}

export function computeNextDueDate(
  currentDue: Date | undefined,
  recurrence: IRecurrence
): Date | undefined {
  const base = currentDue ?? new Date();
  if (recurrence.endsAt && base >= recurrence.endsAt) return undefined;

  switch (recurrence.freq) {
    case "daily":
      return addDays(base, recurrence.interval);
    case "weekly":
      return addWeeks(base, recurrence.interval);
    case "monthly":
      return addMonths(base, recurrence.interval);
    default:
      return undefined;
  }
}
