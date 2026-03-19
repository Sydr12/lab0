"use client";

import { createContext, useContext, useState } from "react";

const FontContext = createContext<{
  titleFont: string;
  setTitleFont: (font: string) => void;
}>({ titleFont: "Pretendard", setTitleFont: () => {} });

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [titleFont, setTitleFont] = useState("Pretendard");
  return (
    <FontContext.Provider value={{ titleFont, setTitleFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useTitleFont() {
  return useContext(FontContext);
}
