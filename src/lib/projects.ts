import fs from "fs";
import path from "path";

export interface ProjectMeta {
  title: string;
  status: "in-progress" | "completed" | "paused";
  tags: string[];
  createdAt: string;
  slug: string;
}

export interface ProjectLog {
  date: string;
  content: string;
}

export interface Project extends ProjectMeta {
  content: string;
  logs: ProjectLog[];
}

const CONTENT_DIR = path.join(process.cwd(), "content/projects");

function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      meta[key] = value;
    }
  }
  return { meta, content: match[2].trim() };
}

function parseTags(raw: string): string[] {
  const match = raw.match(/\[(.*)\]/);
  if (!match) return [];
  return match[1].split(",").map((t) => t.trim());
}

export function getProjects(): ProjectMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const slugs = fs.readdirSync(CONTENT_DIR).filter((f) =>
    fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
  );

  return slugs
    .map((slug) => {
      const indexPath = path.join(CONTENT_DIR, slug, "index.md");
      if (!fs.existsSync(indexPath)) return null;

      const raw = fs.readFileSync(indexPath, "utf-8");
      const { meta } = parseFrontmatter(raw);

      return {
        slug,
        title: meta.title || slug,
        status: (meta.status as ProjectMeta["status"]) || "in-progress",
        tags: parseTags(meta.tags || ""),
        createdAt: meta.createdAt || "",
      };
    })
    .filter(Boolean) as ProjectMeta[];
}

export function getProject(slug: string): Project | null {
  const dir = path.join(CONTENT_DIR, slug);
  if (!fs.existsSync(dir)) return null;

  const indexPath = path.join(dir, "index.md");
  if (!fs.existsSync(indexPath)) return null;

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);

  const logsDir = path.join(dir, "logs");
  const logs: ProjectLog[] = [];

  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter((f) => f.endsWith(".md")).sort().reverse();
    for (const file of files) {
      const logRaw = fs.readFileSync(path.join(logsDir, file), "utf-8");
      logs.push({
        date: file.replace(".md", ""),
        content: logRaw,
      });
    }
  }

  return {
    slug,
    title: meta.title || slug,
    status: (meta.status as ProjectMeta["status"]) || "in-progress",
    tags: parseTags(meta.tags || ""),
    createdAt: meta.createdAt || "",
    content,
    logs,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) =>
    fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
  );
}
