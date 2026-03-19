"use client";

import { useTitleFont } from "@/components/FontContext";

const fonts = [
  {
    name: "Pretendard",
    css: "'Pretendard', sans-serif",
    src: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
  },
  {
    name: "Noto Sans KR",
    css: "'Noto Sans KR', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap",
  },
  {
    name: "Nanum Gothic",
    css: "'Nanum Gothic', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap",
  },
  {
    name: "Nanum Myeongjo",
    css: "'Nanum Myeongjo', serif",
    src: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap",
  },
  {
    name: "Gothic A1",
    css: "'Gothic A1', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;700&display=swap",
  },
  {
    name: "Do Hyeon",
    css: "'Do Hyeon', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap",
  },
  {
    name: "Jua",
    css: "'Jua', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Jua&display=swap",
  },
  {
    name: "Black Han Sans",
    css: "'Black Han Sans', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap",
  },
  {
    name: "Gamja Flower",
    css: "'Gamja Flower', cursive",
    src: "https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap",
  },
  {
    name: "Gowun Dodum",
    css: "'Gowun Dodum', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap",
  },
  {
    name: "IBM Plex Sans KR",
    css: "'IBM Plex Sans KR', sans-serif",
    src: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;700&display=swap",
  },
  {
    name: "Nanum Pen Script",
    css: "'Nanum Pen Script', cursive",
    src: "https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap",
  },
];

const sampleText = "랩제로 Lab0 — 새로운 아이디어를 찾고 연구하는 개인 작업실";

export default function FontsPage() {
  const { titleFont, setTitleFont } = useTitleFont();

  return (
    <>
      {fonts.map((f) => (
        <link key={f.name} rel="stylesheet" href={f.src} />
      ))}
      <div>
        <h1 className="text-2xl font-bold mb-1">글꼴 비교</h1>
        <p className="text-sm text-text-secondary mb-6">
          현재 타이틀 글꼴: <strong>{titleFont}</strong>
        </p>
        <div className="space-y-3">
          {fonts.map((f) => (
            <div
              key={f.name}
              className={`bg-surface-card rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
                titleFont === f.css ? "border-primary bg-primary-light/10" : "border-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary mb-1">{f.name}</p>
                <p
                  className="text-base font-bold truncate"
                  style={{ fontFamily: f.css }}
                >
                  {sampleText}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ fontFamily: f.css }}
                >
                  가나다라마바사 아자차카타파하 0123456789
                </p>
              </div>
              <button
                onClick={() => setTitleFont(f.css)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  titleFont === f.css
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary"
                }`}
              >
                {titleFont === f.css ? "적용중" : "테스트"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
