import { ProjectView } from "@/components/projects/ProjectView";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Project } from "@/models/Project";
import { Types } from "mongoose";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectDB();
  const project = await Project.findOne({
    slug: params.slug,
    userId: new Types.ObjectId(session.user.id),
  }).lean();

  if (!project) notFound();

  return (
    <ProjectView
      projectId={project._id.toString()}
      projectName={project.name}
      colorHex={project.colorHex}
    />
  );
}
