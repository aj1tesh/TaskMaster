import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Label } from "@/models/Label";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const label = await Label.findOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });
  if (!label) return apiError("Label not found", 404);

  const body = await req.json();
  if (body.name) label.name = body.name.trim();
  if (body.colorHex) label.colorHex = body.colorHex;
  await label.save();

  return apiSuccess({ id: label._id.toString(), name: label.name, colorHex: label.colorHex });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const result = await Label.deleteOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });
  if (result.deletedCount === 0) return apiError("Label not found", 404);
  return apiSuccess({ id: params.id });
}
