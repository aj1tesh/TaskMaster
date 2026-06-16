import { ProjectsList } from "@/components/projects/ProjectsList";

export default function ProjectsPage() {
  return (
    <div>
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-medium text-text-primary">Projects</h1>
      </header>
      <ProjectsList />
    </div>
  );
}
