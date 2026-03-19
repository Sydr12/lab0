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
      {/* Meta Info */}
      <div className="flex items-center gap-2 flex-wrap">
        {project.id && (
          <span className="text-[10px] font-mono text-text-secondary bg-surface-card border border-border px-1.5 py-0.5 rounded">
            {project.id}
          </span>
        )}
        <StatusBadge status={project.status} />
        {project.version && (
          <span className="text-[10px] font-mono text-primary bg-primary-light/20 px-1.5 py-0.5 rounded">
            v{project.version}
          </span>
        )}
        <span className="text-xs text-text-secondary">
          {project.createdAt}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs bg-surface-card border border-border rounded-md text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Content Sections */}
      {sections.map((section, i) => {
        const lines = section.split("\n");
        const title = lines[0].trim();
        const body = lines.slice(1).join("\n").trim();
        return (
          <section key={i}>
            <h2 className="text-base font-bold mb-2">{title}</h2>
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
