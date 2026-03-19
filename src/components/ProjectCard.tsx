import type { ProjectMeta } from "@/lib/projects";
import StatusBadge from "./StatusBadge";

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <a
      href={`/projects/${project.slug}`}
      className="block p-5 bg-surface-card rounded-2xl border border-border hover:shadow-md hover:border-primary-light transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          {project.id && <p className="text-[10px] text-text-secondary font-mono">{project.id}</p>}
          <h3 className="font-semibold text-base">{project.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={project.status} />
          {project.version && <span className="text-[10px] text-text-secondary font-mono">{project.version}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs bg-surface rounded-md text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-text-secondary">{project.createdAt}</p>
    </a>
  );
}
