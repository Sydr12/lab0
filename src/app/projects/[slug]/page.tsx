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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
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

      {/* Content */}
      <section className="bg-surface-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">📋 개요</h2>
        <div className="prose prose-sm max-w-none text-text-primary whitespace-pre-wrap">
          {project.content}
        </div>
      </section>

      {/* Logs */}
      {project.logs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">📝 로그</h2>
          <div className="space-y-4">
            {project.logs.map((log) => (
              <div
                key={log.date}
                className="bg-surface-card rounded-2xl border border-border p-5"
              >
                <p className="text-xs font-medium text-primary mb-2">
                  {log.date}
                </p>
                <div className="text-sm text-text-primary whitespace-pre-wrap">
                  {log.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
