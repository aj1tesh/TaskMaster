import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Task } from "@/models/Task";
import { serializeTask } from "@/lib/tasks";

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const { ids, updates } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return apiError("ids required");

  const updateDoc: Record<string, unknown> = {};
  if (updates.projectId !== undefined) {
    updateDoc.projectId = updates.projectId
      ? new Types.ObjectId(updates.projectId)
      : undefined;
  }
  if (updates.dueDate !== undefined) {
    updateDoc.dueDate = updates.dueDate ? new Date(updates.dueDate) : undefined;
  }
  if (updates.status) updateDoc.status = updates.status;
  if (updates.priority) updateDoc.priority = updates.priority;

  await Task.updateMany(
    { _id: { $in: ids }, userId: new Types.ObjectId(userId!) },
    { $set: updateDoc }
  );

  const tasks = await Task.find({
    _id: { $in: ids },
    userId: new Types.ObjectId(userId!),
  });

  return apiSuccess(tasks.map(serializeTask));
}

export async function DELETE(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) return apiError("ids required");

  await Task.deleteMany({
    _id: { $in: ids },
    userId: new Types.ObjectId(userId!),
  });

  return apiSuccess({ deleted: ids.length });
}
