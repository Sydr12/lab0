"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

interface PageMeta {
  banner?: string;
  title: string;
  subtitle: string;
}

const pageMetaMap: Record<string, PageMeta> = {
  "/": {
    banner: "/banners/A0000.webp",
    title: "Projects",
    subtitle: "새로운 아이디어를 찾고 연구하는 공간",
  },
};

const projectMetaMap: Record<string, PageMeta> = {
  homepage: {
    banner: "/banners/A0000.webp",
    title: "Lab0",
    subtitle: "개인 연구 포털 구축",
  },
  reel1: {
    banner: "/banners/A0001.webp",
    title: "Reel1",
    subtitle: "AI를 활용한 20분 단편 영화 제작",
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
        <div className="max-w-3xl mx-auto px-5">
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
        </div>
      </div>
    </div>
  );
}
