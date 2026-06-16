import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Project } from "@/models/Project";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const project = await Project.findOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  }).lean();

  if (!project) return apiError("Project not found", 404);

  return apiSuccess({
    id: project._id.toString(),
    name: project.name,
    slug: project.slug,
    colorHex: project.colorHex,
    isArchived: project.isArchived,
    order: project.order,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const project = await Project.findOne({
    _id: params.id,
    userId: new Types.ObjectId(userId!),
  });

  if (!project) return apiError("Project not found", 404);

  const body = await req.json();
  if (body.name) project.name = body.name;
  if (body.colorHex) project.colorHex = body.colorHex;
  if (body.isArchived !== undefined) project.isArchived = body.isArchived;
  if (body.order !== undefined) project.order = body.order;

  await project.save();

  return apiSuccess({
    id: project._id.toString(),
    name: project.name,
    slug: project.slug,
    colorHex: project.colorHex,
    isArchived: project.isArchived,
    order: project.order,
  });
}
