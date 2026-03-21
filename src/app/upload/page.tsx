"use client";

import { useState, useRef } from "react";

export default function UploadPage() {
  const [log, setLog] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [subdir, setSubdir] = useState("san4");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-20), msg]);
  };

  const loadFiles = async () => {
    const res = await fetch("/api/upload");
    const data = await res.json();
    setFiles(data.files || []);
  };

  const handleUpload = async () => {
    const input = inputRef.current;
    if (!input?.files?.length) {
      addLog("파일을 선택하세요");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.set("subdir", subdir);

    for (let i = 0; i < input.files.length; i++) {
      formData.append("files", input.files[i]);
    }

    addLog("업로드 중... (" + input.files.length + "개)");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) {
        addLog("✅ 완료: " + data.files.join(", "));
        loadFiles();
      } else {
        addLog("❌ 실패: " + data.error);
      }
    } catch (e: any) {
      addLog("❌ 에러: " + e.message);
    }
    setUploading(false);
    if (input) input.value = "";
  };

  useState(() => {
    loadFiles();
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">파일 업로드</h2>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span className="text-sm text-text-secondary">폴더:</span>
        <input
          value={subdir}
          onChange={(e) => setSubdir(e.target.value)}
          className="text-sm px-2 py-1 rounded border border-border bg-surface-card"
          style={{ width: "120px" }}
        />
        <input
          ref={inputRef}
          type="file"
          multiple
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="text-sm px-4 py-1 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "업로드"}
        </button>
        <button
          onClick={loadFiles}
          className="text-sm px-4 py-1 bg-surface-card border border-border rounded-lg"
        >
          새로고침
        </button>
      </div>

      {/* 로그 */}
      <div className="bg-black rounded-xl p-3 text-xs font-mono max-h-32 overflow-y-auto" style={{ color: "#aaa" }}>
        {log.map((l, i) => (
          <div key={i} className={l.startsWith("❌") ? "text-red-500" : l.startsWith("✅") ? "text-green-500" : ""}>
            {l}
          </div>
        ))}
      </div>

      {/* 파일 목록 */}
      <div className="bg-surface-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold mb-2">업로드된 파일 ({files.length}개)</h3>
        <div className="text-xs font-mono max-h-60 overflow-y-auto space-y-0.5">
          {files.length === 0 ? (
            <div className="text-text-secondary">파일 없음</div>
          ) : (
            files.map((f, i) => (
              <div key={i} className="text-text-secondary">{f}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
