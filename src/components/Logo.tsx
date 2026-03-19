"use client";

import { useTitleFont } from "./FontContext";

export default function Logo() {
  const { titleFont } = useTitleFont();

  return (
    <a href="/" className="inline-flex items-end gap-2">
      <span className="neon-glow bg-text-primary text-white text-sm font-bold px-2 py-0.5 rounded-md tracking-wide">
        Lab<span className="text-primary-light">0</span>
      </span>
      <span className="text-sm font-bold text-text-primary" style={{ fontFamily: "'Do Hyeon', sans-serif" }}>
        랩제로
      </span>
    </a>
  );
}
