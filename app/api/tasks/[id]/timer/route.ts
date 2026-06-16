import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess } from "@/lib/api-helpers";
import { TimerSession } from "@/models/TimerSession";
import { serializeTask } from "@/lib/tasks";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const sessions = await TimerSession.find({
    userId: new Types.ObjectId(userId!),
    taskId: new Types.ObjectId(params.id),
    durationMinutes: { $exists: true },
  })
    .sort({ startedAt: -1 })
    .limit(20)
    .lean();

  const totalMinutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);

  return apiSuccess({
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString(),
      durationMinutes: s.durationMinutes,
    })),
    totalMinutes,
  });
}
