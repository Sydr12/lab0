"use client";

import dynamic from "next/dynamic";

const IdolContent = dynamic(() => import("./IdolContent"), { ssr: false });

export default function IdolPage() {
  return <IdolContent />;
}
