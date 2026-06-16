import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Task } from "@/models/Task";
import { serializeTask, startOfDay, endOfDay } from "@/lib/tasks";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const { searchParams } = req.nextUrl;
  const view = searchParams.get("view");
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const labelId = searchParams.get("labelId");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort") || "order";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const cursor = searchParams.get("cursor");

  const parentTaskId = searchParams.get("parentTaskId");
  const dueFrom = searchParams.get("dueFrom");
  const dueTo = searchParams.get("dueTo");

  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId!),
  };

  if (parentTaskId) {
    filter.parentTaskId = new Types.ObjectId(parentTaskId);
  } else {
    filter.parentTaskId = { $exists: false };
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (view === "inbox") {
    filter.$and = [
      { $or: [{ projectId: { $exists: false } }, { projectId: null }] },
      { $or: [{ dueDate: { $exists: false } }, { dueDate: null }] },
    ];
    filter.status = { $nin: ["done", "cancelled"] };
  } else if (view === "today") {
    filter.$or = [
      { dueDate: { $gte: todayStart, $lte: todayEnd }, status: { $nin: ["done", "cancelled"] } },
      { dueDate: { $lt: todayStart }, status: { $nin: ["done", "cancelled"] } },
    ];
  } else if (view === "completed-today") {
    filter.status = "done";
    filter.completedAt = { $gte: todayStart, $lte: todayEnd };
  } else if (view === "upcoming") {
    filter.dueDate = { $exists: true };
    filter.status = { $nin: ["done", "cancelled"] };
  }

  if (projectId) filter.projectId = new Types.ObjectId(projectId);
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (labelId) filter.labelIds = new Types.ObjectId(labelId);
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) (filter.dueDate as Record<string, Date>).$gte = new Date(dueFrom);
    if (dueTo) (filter.dueDate as Record<string, Date>).$lte = new Date(dueTo);
  }
  if (q) filter.title = { $regex: q, $options: "i" };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    order: { order: 1, createdAt: -1 },
    due: { dueDate: 1, order: 1 },
    created: { createdAt: -1 },
    priority: { priority: -1, order: 1 },
  };

  if (cursor) {
    filter._id = { $lt: new Types.ObjectId(cursor) };
  }

  const tasks = await Task.find(filter)
    .sort(sortMap[sort] || sortMap.order)
    .limit(limit + 1)
    .lean();

  const hasMore = tasks.length > limit;
  const items = hasMore ? tasks.slice(0, limit) : tasks;
  const nextCursor = hasMore ? items[items.length - 1]._id.toString() : undefined;

  return apiSuccess(
    items.map((t) => serializeTask(t as Parameters<typeof serializeTask>[0])),
    { nextCursor, hasMore }
  );
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const body = await req.json();
  if (!body.title?.trim()) return apiError("Title is required");

  const maxOrder = await Task.findOne({ userId }).sort({ order: -1 }).select("order").lean();
  const order = (maxOrder?.order ?? 0) + 1;

  const task = await Task.create({
    userId,
    title: body.title.trim(),
    description: body.description || "",
    status: body.status || "inbox",
    priority: body.priority || "none",
    projectId: body.projectId || undefined,
    parentTaskId: body.parentTaskId || undefined,
    labelIds: body.labelIds || [],
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    reminderAt: body.reminderAt ? new Date(body.reminderAt) : undefined,
    recurrence: body.recurrence || undefined,
    order: body.order ?? order,
    timeEstimateMinutes: body.timeEstimateMinutes,
  });

  return apiSuccess(serializeTask(task), undefined, 201);
}
