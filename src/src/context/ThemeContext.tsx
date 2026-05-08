import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => { },
  isDark: false,
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useMuiTableColors() {
  const { isDark } = useContext(ThemeContext);
  return {
    bg: isDark ? "#1e293b" : "#ffffff",
    bgMuted: isDark ? "#0f172a" : "#f2f2f2",
    textPrimary: isDark ? "#e2e8f0" : "#002b45",
    textBody: isDark ? "#e2e8f0" : "#4d4e4c",
    textMuted: isDark ? "#64748b" : "#afafaf",
    borderColor: isDark ? "#334155" : "#eeeeee",
    inputBorder: isDark ? "#334155" : undefined,
    inputText: isDark ? "#e2e8f0" : undefined,
  };
}

function resolveIsDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", resolveIsDark(theme));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("ssu-theme") as Theme | null;
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  const [isDark, setIsDark] = useState(() =>
    resolveIsDark(
      (() => {
        const stored = localStorage.getItem("ssu-theme") as Theme | null;
        return stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
      })(),
    ),
  );

  useEffect(() => {
    const dark = resolveIsDark(theme);
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
      setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(next: Theme) {
    localStorage.setItem("ssu-theme", next);
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
