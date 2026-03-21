import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/data/data/com.termux/files/home/projects/uploads";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const subdir = (formData.get("subdir") as string) || "";

    const targetDir = path.join(UPLOAD_DIR, subdir);
    await mkdir(targetDir, { recursive: true });

    const results: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(targetDir, file.name);
      await writeFile(filePath, buffer);
      results.push(file.name + " (" + (buffer.length / 1024).toFixed(0) + "KB)");
    }

    return NextResponse.json({ ok: true, files: results, dir: targetDir });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // 업로드된 파일 목록
  const fs = await import("fs");
  const listDir = (dir: string, prefix = ""): string[] => {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results: string[] = [];
    for (const e of entries) {
      const rel = prefix ? prefix + "/" + e.name : e.name;
      if (e.isDirectory()) {
        results.push(...listDir(path.join(dir, e.name), rel));
      } else {
        const stat = fs.statSync(path.join(dir, e.name));
        results.push(rel + " (" + (stat.size / 1024).toFixed(0) + "KB)");
      }
    }
    return results;
  };

  return NextResponse.json({ files: listDir(UPLOAD_DIR) });
}
