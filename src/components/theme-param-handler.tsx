"use client";

import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, Suspense } from "react";

function ThemeParamHandlerContent() {
  const searchParams = useSearchParams();
  const { setTheme, theme: currentTheme } = useTheme();

  useEffect(() => {
    const themeParam = searchParams.get("theme");
    if (themeParam === "light" || themeParam === "dark") {
      if (themeParam !== currentTheme) {
        setTheme(themeParam);
      }
    }
  }, [searchParams, setTheme, currentTheme]);

  return null;
}

export function ThemeParamHandler() {
  return (
    <Suspense fallback={null}>
      <ThemeParamHandlerContent />
    </Suspense>
  );
}
