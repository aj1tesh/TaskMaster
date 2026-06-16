import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers";
import { Project } from "@/models/Project";
import { PROJECT_COLORS, slugifyProjectName } from "@/lib/projects";

async function uniqueSlug(userId: string, base: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (
    await Project.findOne({
      userId: new Types.ObjectId(userId),
      slug,
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const projects = await Project.find({
    userId: new Types.ObjectId(userId!),
    isArchived: false,
  })
    .sort({ order: 1 })
    .lean();

  return apiSuccess(
    projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      colorHex: p.colorHex,
      isArchived: p.isArchived,
      order: p.order,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return apiError("Project name is required");

  const baseSlug = slugifyProjectName(body.slug || name);
  if (!baseSlug) return apiError("Invalid project name");

  const slug = await uniqueSlug(userId!, baseSlug);
  const maxOrder = await Project.findOne({ userId })
    .sort({ order: -1 })
    .select("order")
    .lean();

  try {
    const project = await Project.create({
      userId,
      name,
      slug,
      colorHex: body.colorHex || PROJECT_COLORS[1],
      order: (maxOrder?.order ?? 0) + 1,
    });

    return apiSuccess(
      {
        id: project._id.toString(),
        name: project.name,
        slug: project.slug,
        colorHex: project.colorHex,
        isArchived: project.isArchived,
        order: project.order,
      },
      undefined,
      201
    );
  } catch {
    return apiError("Could not create project", 500);
  }
}
