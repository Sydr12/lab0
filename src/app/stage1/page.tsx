"use client";

import dynamic from "next/dynamic";

const StageContent = dynamic(() => import("./StageContent"), { ssr: false });

export default function StagePage() {
  return <StageContent />;
}
