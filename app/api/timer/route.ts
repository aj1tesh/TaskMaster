import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { TimerSession } from "@/models/TimerSession";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const session = await TimerSession.findOne({
    userId: new Types.ObjectId(userId!),
    endedAt: { $exists: false },
  }).lean();

  if (!session) return apiSuccess(null);

  const { Task } = await import("@/models/Task");
  const task = await Task.findById(session.taskId).select("title").lean();

  return apiSuccess({
    id: session._id.toString(),
    taskId: session.taskId.toString(),
    taskTitle: task?.title,
    startedAt: session.startedAt.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const { action, taskId } = await req.json();

  if (action === "start") {
    if (!taskId) return apiError("taskId required");

    await TimerSession.updateMany(
      { userId: new Types.ObjectId(userId!), endedAt: { $exists: false } },
      { $set: { endedAt: new Date() } }
    );

    const session = await TimerSession.create({
      userId,
      taskId,
      startedAt: new Date(),
    });

    return apiSuccess({
      id: session._id.toString(),
      taskId: session.taskId.toString(),
      startedAt: session.startedAt.toISOString(),
    });
  }

  if (action === "stop") {
    const session = await TimerSession.findOne({
      userId: new Types.ObjectId(userId!),
      endedAt: { $exists: false },
      ...(taskId ? { taskId: new Types.ObjectId(taskId) } : {}),
    });

    if (!session) return apiError("No running timer", 404);

    session.endedAt = new Date();
    session.durationMinutes = Math.round(
      (session.endedAt.getTime() - session.startedAt.getTime()) / 60000
    );
    await session.save();

    return apiSuccess({
      id: session._id.toString(),
      durationMinutes: session.durationMinutes,
    });
  }

  return apiError("Invalid action");
}
