import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import type { LabelDTO, ProjectDTO, SmartListDTO } from "@/lib/api";

export interface BootstrapTimer {
  taskId: string;
  taskTitle?: string;
  startedAt: string;
}

export interface BootstrapData {
  projects: ProjectDTO[];
  labels: LabelDTO[];
  smartLists: SmartListDTO[];
  timer: BootstrapTimer | null;
}

export async function getBootstrapData(userId: string): Promise<BootstrapData> {
  await connectDB();

  const [{ Project }, { Label }, { User }, { TimerSession }, { Task }] =
    await Promise.all([
      import("@/models/Project"),
      import("@/models/Label"),
      import("@/models/User"),
      import("@/models/TimerSession"),
      import("@/models/Task"),
    ]);

  const uid = new Types.ObjectId(userId);

  const [projects, labels, user, session] = await Promise.all([
    Project.find({ userId: uid, isArchived: false }).sort({ order: 1 }).lean(),
    Label.find({ userId: uid }).sort({ name: 1 }).lean(),
    User.findById(uid).select("preferences.smartLists").lean(),
    TimerSession.findOne({ userId: uid, endedAt: { $exists: false } }).lean(),
  ]);

  let timer: BootstrapTimer | null = null;
  if (session) {
    const task = await Task.findById(session.taskId).select("title").lean();
    timer = {
      taskId: session.taskId.toString(),
      taskTitle: task?.title,
      startedAt: session.startedAt.toISOString(),
    };
  }

  return {
    projects: projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      colorHex: p.colorHex,
      isArchived: p.isArchived,
      order: p.order,
    })),
    labels: labels.map((l) => ({
      id: l._id.toString(),
      name: l.name,
      colorHex: l.colorHex,
    })),
    smartLists: (user?.preferences?.smartLists ?? []).map((list) => ({
      id: list.id,
      name: list.name,
      filters: list.filters as Record<string, string>,
    })),
    timer,
  };
}
