"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

interface PageMeta {
  banner?: string;
  title: string;
  subtitle: string;
  link?: string;
}

const pageMetaMap: Record<string, PageMeta> = {
  "/": {
    banner: "/banners/A0000.webp",
    title: "Projects",
    subtitle: "새로운 아이디어를 찾고 연구하는 공간",
  },
  "/stage1": {
    title: "Stage1",
    subtitle: "Web MMD 뷰어 & 댄스 스테이지",
  },
};

const projectMetaMap: Record<string, PageMeta> = {
  homepage: {
    banner: "/banners/A0000.webp",
    title: "Lab0",
    subtitle: "개인 연구 포털 구축",
  },
  stage1: {
    title: "Stage1",
    subtitle: "Web MMD 뷰어 & 댄스 스테이지",
    link: "/stage1",
  },
};

function getPageMeta(pathname: string): PageMeta {
  if (pageMetaMap[pathname]) return pageMetaMap[pathname];

  const projectMatch = pathname.match(/^\/projects\/(.+)$/);
  if (projectMatch && projectMetaMap[projectMatch[1]]) {
    return projectMetaMap[projectMatch[1]];
  }

  return { title: "Lab0", subtitle: "" };
}

export default function HeroBanner() {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const [imgError, setImgError] = useState(false);
  const [pressed, setPressed] = useState(false);
  const showImage = meta.banner && !imgError;

  return (
    <div className="w-full h-48 sm:h-64 relative overflow-hidden">
      {showImage ? (
        <img
          src={meta.banner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-black" />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="max-w-3xl mx-auto px-5 flex items-end justify-between">
          <div
            className={`inline-block rounded-xl px-4 py-3 transition-all duration-150 cursor-default select-none ${
              pressed
                ? "bg-white shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                : "bg-black/30 backdrop-blur-[2px] shadow-[0_4px_30px_rgba(0,0,0,0.7)]"
            }`}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
          >
            <h1
              className={`text-lg sm:text-xl font-bold transition-colors duration-150 ${
                pressed ? "text-text-primary" : "text-white"
              }`}
            >
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p
                className={`text-xs mt-0.5 transition-colors duration-150 ${
                  pressed ? "text-text-secondary" : "text-white/70"
                }`}
              >
                {meta.subtitle}
              </p>
            )}
          </div>
          {meta.link && (
            <a
              href={meta.link}
              className="px-3 py-1.5 bg-white/90 text-text-primary text-xs font-bold rounded-lg shadow-md hover:bg-white transition-all flex items-center gap-1"
            >
              이동
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 2l4 4-4 4" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
