"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const pageBannerMap: Record<string, string> = {
  "/": "/banners/A0001.webp",
  "/projects/homepage": "/banners/A0001.webp",
};

export default function HeroBanner() {
  const pathname = usePathname();
  const bannerSrc = pageBannerMap[pathname];
  const [imgError, setImgError] = useState(false);
  const showImage = bannerSrc && !imgError;

  return (
    <div className="w-full h-48 sm:h-64 relative overflow-hidden">
      {showImage ? (
        <img
          src={bannerSrc}
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
          <div className="inline-block bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3">
            <h1 className="text-white text-lg sm:text-xl font-bold">Projects</h1>
            <p className="text-white/70 text-xs mt-0.5">새로운 아이디어를 찾고 연구하는 공간</p>
          </div>
        </div>
      </div>
    </div>
  );
}
