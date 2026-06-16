"use client";

import Link from "next/link";
import { useProjects } from "@/components/providers/AppDataProvider";
import { ProjectDot } from "./ProjectDot";
import { CreateProjectForm } from "./CreateProjectForm";

export function ProjectsList() {
  const { projects, ready, refreshProjects } = useProjects();

  if (!ready) {
    return (
      <div className="p-6 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-11 animate-pulse-flat rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-border px-6 py-4">
        <CreateProjectForm onCreated={refreshProjects} />
      </div>
      <div className="divide-y divide-border">
        {projects.length === 0 ? (
          <p className="px-6 py-8 text-sm text-text-muted">
            No projects yet — create one above.
          </p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="flex min-h-[44px] items-center gap-3 px-6 py-3 hover:bg-raised"
            >
              <ProjectDot colorHex={project.colorHex} />
              <span className="text-sm text-text-primary">{project.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
