import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Label } from "@/models/Label";

const LABEL_COLORS = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#ec4899",
  "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4",
];

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const labels = await Label.find({ userId: new Types.ObjectId(userId!) }).sort({ name: 1 }).lean();

  return apiSuccess(
    labels.map((l) => ({
      id: l._id.toString(),
      name: l.name,
      colorHex: l.colorHex,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const { name, colorHex } = await req.json();
  if (!name?.trim()) return apiError("Name is required");

  const label = await Label.create({
    userId,
    name: name.trim(),
    colorHex: colorHex || LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)],
  });

  return apiSuccess(
    { id: label._id.toString(), name: label.name, colorHex: label.colorHex },
    undefined,
    201
  );
}
