import { getProject, getAllSlugs } from "@/lib/projects";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const sections = project.content.split(/^## /m).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-card rounded-2xl border border-border p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {project.id && (
              <span className="text-[10px] font-mono text-text-secondary bg-surface px-1.5 py-0.5 rounded">
                {project.id}
              </span>
            )}
            <h1 className="text-2xl font-bold mt-1">{project.title}</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={project.status} />
            {project.version && (
              <span className="text-[10px] font-mono text-primary bg-primary-light/20 px-1.5 py-0.5 rounded">
                v{project.version}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-surface rounded-md text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-secondary">
          시작일: {project.createdAt}
        </p>
      </div>

      {/* Content Sections */}
      {sections.map((section, i) => {
        const lines = section.split("\n");
        const title = lines[0].trim();
        const body = lines.slice(1).join("\n").trim();
        return (
          <section key={i} className="bg-surface-card rounded-2xl border border-border p-5">
            <h2 className="text-base font-bold mb-3">{title}</h2>
            <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
              {body}
            </div>
          </section>
        );
      })}

      {/* Logs */}
      {project.logs.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-4">진행 로그</h2>
          <div className="relative pl-4 border-l-2 border-primary-light space-y-4">
            {project.logs.map((log) => (
              <div key={log.date} className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                <div className="bg-surface-card rounded-2xl border border-border p-4">
                  <p className="text-xs font-bold text-primary mb-2">
                    {log.date}
                  </p>
                  <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {log.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
