"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { label: "홈", href: "/" },
  {
    label: "프로젝트",
    children: [
      { label: "전체 목록", href: "/projects" },
      { label: "진행중", href: "/projects?status=in-progress" },
      { label: "완료", href: "/projects?status=completed" },
    ],
  },
  {
    label: "자료실",
    children: [
      { label: "북마크", href: "/collect/bookmarks" },
      { label: "메모", href: "/collect/notes" },
    ],
  },
  {
    label: "도구",
    children: [
      { label: "글꼴 비교", href: "/fonts" },
      { label: "Stage1", href: "/stage1" },
      { label: "Idol2", href: "/idol2" },
    ],
  },
  { label: "설정", href: "/settings" },
];

function MenuCategory({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  if (!item.children) {
    return (
      <a
        href={item.href}
        onClick={onClose}
        className="block px-3 py-2 text-sm font-medium rounded-lg text-text-primary hover:bg-white/40 transition-colors"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-text-primary hover:bg-white/40 transition-colors"
      >
        {item.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {item.children.map((child) => (
          <a
            key={child.href}
            href={child.href}
            onClick={onClose}
            className="block px-3 py-1.5 pl-7 text-xs text-text-secondary hover:text-text-primary hover:bg-white/30 rounded-lg transition-colors"
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SidebarPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 w-2/3 bg-white/30 backdrop-blur-sm rounded-br-2xl border-r border-b border-border z-[70] transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-10 border-b border-border">
          <span className="bg-text-primary text-white text-xs font-bold px-2 py-0.5 rounded-md tracking-wide">
            Lab<span className="text-primary-light">0</span>
          </span>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>
        <nav className="px-3 py-3 space-y-0.5">
          {menuItems.map((item) => (
            <MenuCategory key={item.label} item={item} onClose={onClose} />
          ))}
        </nav>
      </aside>
    </>,
    document.body
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-14 left-4 z-[55] w-7 h-7 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white transition-all"
        aria-label="메뉴 열기"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
      </button>
      <SidebarPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
