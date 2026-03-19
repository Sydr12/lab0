import { getProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const projects = getProjects();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-1">Projects</h1>
        <p className="text-sm text-text-secondary mb-6">
          프로젝트 허브
        </p>
        {projects.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm bg-surface-card rounded-2xl border border-border">
            아직 프로젝트가 없습니다
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
