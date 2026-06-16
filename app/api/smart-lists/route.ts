import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { User } from "@/models/User";
import { randomUUID } from "crypto";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const user = await User.findById(userId).select("preferences.smartLists").lean();
  return apiSuccess(user?.preferences?.smartLists ?? []);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { name, filters } = await req.json();
  if (!name?.trim()) return apiError("Name is required");

  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  const list = { id: randomUUID(), name: name.trim(), filters: filters || {} };
  if (!user.preferences.smartLists) user.preferences.smartLists = [];
  user.preferences.smartLists.push(list);
  await user.save();

  return apiSuccess(list, undefined, 201);
}

export async function DELETE(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { id } = await req.json();
  const user = await User.findById(userId);
  if (!user) return apiError("User not found", 404);

  user.preferences.smartLists = (user.preferences.smartLists || []).filter(
    (l) => l.id !== id
  );
  await user.save();
  return apiSuccess({ id });
}
