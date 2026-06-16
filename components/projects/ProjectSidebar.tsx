"use client";

import Link from "next/link";
import { useProjects } from "@/components/providers/AppDataProvider";
import { ProjectDot } from "./ProjectDot";
import { CreateProjectForm } from "./CreateProjectForm";

export function ProjectSidebar() {
  const { projects, refreshProjects } = useProjects();

  return (
    <div className="space-y-1">
      <CreateProjectForm compact onCreated={refreshProjects} />
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.slug}`}
          className="flex h-10 items-center gap-3 rounded-none px-3 text-sm text-text-muted hover:bg-raised hover:text-text-primary"
        >
          <ProjectDot colorHex={project.colorHex} />
          {project.name}
        </Link>
      ))}
    </div>
  );
}
