import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Project } from "@/models/Project";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const project = await Project.findOne({
    slug: params.slug,
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
