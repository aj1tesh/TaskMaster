import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess } from "@/lib/api-helpers";
import { TimerSession } from "@/models/TimerSession";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const uid = new Types.ObjectId(userId!);
  const weekStart = startOfDay(subDays(new Date(), 7));

  const [sessions, completedThisWeek, streakDays, projects] = await Promise.all([
    TimerSession.find({
      userId: uid,
      startedAt: { $gte: weekStart },
      durationMinutes: { $exists: true },
    }).lean(),
    Task.countDocuments({
      userId: uid,
      status: "done",
      completedAt: { $gte: weekStart },
    }),
    computeStreak(uid),
    Project.find({ userId: uid }).lean(),
  ]);

  const taskIds = sessions.map((s) => s.taskId);
  const tasks = await Task.find({ _id: { $in: taskIds } }).select("projectId").lean();
  const taskProjectMap = new Map(tasks.map((t) => [t._id.toString(), t.projectId?.toString()]));

  const byProject: Record<string, number> = {};
  for (const s of sessions) {
    const pid = taskProjectMap.get(s.taskId.toString()) || "none";
    byProject[pid] = (byProject[pid] || 0) + (s.durationMinutes || 0);
  }

  const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));
  projectMap.set("none", "No project");

  const timeByProject = Object.entries(byProject).map(([id, minutes]) => ({
    name: projectMap.get(id) || "Unknown",
    minutes,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));

  return apiSuccess({
    timeByProject,
    completedThisWeek,
    streakDays,
    totalMinutes: sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0),
  });
}

async function computeStreak(userId: Types.ObjectId): Promise<number> {
  const today = startOfDay(new Date());
  const lookbackStart = subDays(today, 365);

  const results = await Task.aggregate<{ _id: string }>([
    {
      $match: {
        userId,
        status: "done",
        completedAt: { $gte: lookbackStart },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
        },
      },
    },
  ]);

  const completedDays = new Set(results.map((r) => r._id));
  let streak = 0;
  let day = today;

  while (completedDays.has(format(day, "yyyy-MM-dd"))) {
    streak++;
    day = subDays(day, 1);
  }

  return streak;
}
