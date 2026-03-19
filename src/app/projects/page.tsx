import { getProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">모든 프로젝트</h1>
      <p className="text-sm text-text-secondary mb-6">
        진행중인 프로젝트와 완료된 프로젝트 목록
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
    </div>
  );
}
