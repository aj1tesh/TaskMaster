import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import { Label } from "@/models/Label";
import { TimerSession } from "@/models/TimerSession";

export async function DELETE() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const uid = new Types.ObjectId(userId!);

  await Promise.all([
    Task.deleteMany({ userId: uid }),
    Project.deleteMany({ userId: uid }),
    Label.deleteMany({ userId: uid }),
    TimerSession.deleteMany({ userId: uid }),
    User.deleteOne({ _id: uid }),
  ]);

  return apiSuccess({ deleted: true });
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return apiError("No file uploaded", 400);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${userId}.${ext}`;
  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "avatars");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  const user = await User.findById(userId);
  if (user) {
    user.avatar = `/avatars/${filename}`;
    await user.save();
  }

  return apiSuccess({ avatar: `/avatars/${filename}` });
}
