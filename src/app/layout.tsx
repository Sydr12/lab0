import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lab0",
  description: "Personal project lab",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-surface text-text-primary font-sans antialiased">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
          <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold tracking-tight">
              Lab0
            </a>
            <div className="flex gap-4 text-sm text-text-secondary">
              <a href="/" className="hover:text-text-primary transition-colors">
                홈
              </a>
              <a
                href="/projects"
                className="hover:text-text-primary transition-colors"
              >
                프로젝트
              </a>
            </div>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>
        <footer className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-text-secondary border-t border-border">
          © 2026 Lab0
        </footer>
      </body>
    </html>
  );
}
