import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Task } from "@/models/Task";
import { serializeTask } from "@/lib/tasks";
import { computeNextDueDate } from "@/lib/parse-quick-add";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const task = await Task.findOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });

  if (!task) return apiError("Task not found", 404);
  return apiSuccess(serializeTask(task));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const task = await Task.findOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });

  if (!task) return apiError("Task not found", 404);

  const body = await req.json();
  const wasDoneBefore = task.status === "done";
  const allowed = [
    "title", "description", "status", "priority", "projectId",
    "labelIds", "dueDate", "reminderAt", "order", "timeEstimateMinutes", "recurrence",
  ] as const;

  for (const key of allowed) {
    if (!(key in body)) continue;

    switch (key) {
      case "title":
        task.title = body.title;
        break;
      case "description":
        task.description = body.description;
        break;
      case "status":
        task.status = body.status;
        break;
      case "priority":
        task.priority = body.priority;
        break;
      case "projectId":
        task.projectId = body.projectId
          ? new Types.ObjectId(body.projectId)
          : undefined;
        break;
      case "labelIds":
        task.labelIds = (body.labelIds || []).map(
          (id: string) => new Types.ObjectId(id)
        );
        break;
      case "dueDate":
        task.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
        break;
      case "reminderAt":
        task.reminderAt = body.reminderAt ? new Date(body.reminderAt) : undefined;
        break;
      case "order":
        task.order = body.order;
        break;
      case "timeEstimateMinutes":
        task.timeEstimateMinutes = body.timeEstimateMinutes;
        break;
      case "recurrence":
        task.recurrence = body.recurrence || undefined;
        break;
    }
  }

  const wasDone = task.status === "done";
  if (body.status === "done" && !task.completedAt) {
    task.completedAt = new Date();
  } else if (body.status && body.status !== "done") {
    task.completedAt = undefined;
  }

  await task.save();

  if (body.status === "done" && !wasDoneBefore && task.recurrence) {
    const nextDue = computeNextDueDate(task.dueDate, task.recurrence);
    if (nextDue) {
      await Task.create({
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: "todo",
        priority: task.priority,
        projectId: task.projectId,
        labelIds: task.labelIds,
        dueDate: nextDue,
        recurrence: task.recurrence,
        order: task.order,
        timeEstimateMinutes: task.timeEstimateMinutes,
      });
    }
  }

  return apiSuccess(serializeTask(task));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const result = await Task.deleteOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });

  if (result.deletedCount === 0) return apiError("Task not found", 404);
  return apiSuccess({ id: params.id });
}
