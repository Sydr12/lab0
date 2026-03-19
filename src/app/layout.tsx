import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { FontProvider } from "@/components/FontContext";
import Logo from "@/components/Logo";

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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap"
        />
      </head>
      <body className="bg-surface text-text-primary font-sans antialiased">
        <FontProvider>
        <header className="sticky top-0 z-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gray-200" style={{ clipPath: "polygon(65% 0%, 100% 0%, 100% 100%, 85% 100%)" }} />
          <div className="absolute inset-0 bg-gray-300" style={{ clipPath: "polygon(75% 0%, 100% 0%, 100% 100%, 92% 100%)" }} />
          <div className="relative z-10 h-1 bg-red-500" />
          <nav className="relative z-10 max-w-3xl mx-auto px-2 h-10 flex items-end pb-1 justify-between">
            <Logo />
            <div className="flex items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-text-primary rounded-full">
                <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                  <img src="https://flagcdn.com/kr.svg" alt="KR" className="w-full h-full object-cover" />
                </span>
                <span className="text-white font-bold text-xs">여덟글자닉네임</span>
              </span>
              <a href="/settings" className="w-5 h-5 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-[10px] hover:bg-surface transition-colors flex-shrink-0">
                ⚙️
              </a>
            </div>
          </nav>

        </header>
        <Sidebar />
        {/* Hero Banner */}
        <div className="w-full h-48 sm:h-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-black" />
          {/* 실제 이미지 사용 시: */}
          {/* <img src="/banner.jpg" alt="banner" className="absolute inset-0 w-full h-full object-cover" /> */}
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
        <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>
        <footer className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-text-secondary border-t border-border">
          © 2026 Lab0
        </footer>
        </FontProvider>
      </body>
    </html>
  );
}
