import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

const STORAGE_KEY = "ssu-font-scale";
const CSS_VAR = "--ssu-font-scale";

export const FONT_SCALE_MIN = 0.5;
export const FONT_SCALE_MAX = 3.0;

export const FONT_SCALE_PRESETS: { label: string; factor: number }[] = [
  { label: "S", factor: 0.8 },
  { label: "M", factor: 1.0 },
  { label: "L", factor: 1.25 },
  { label: "XL", factor: 1.5 },
];

interface FontScaleContextValue {
  factor: number;
  setFactor: (n: number) => void;
}

const FontScaleContext = createContext<FontScaleContextValue>({
  factor: 1,
  setFactor: () => {},
});

export function useFontScale(): FontScaleContextValue {
  return useContext(FontScaleContext);
}

function clamp(n: number): number {
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, n));
}

function readStored(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 1;
  // Backwards compat: previously stored preset strings.
  switch (stored) {
    case "sm":
      return 0.8;
    case "md":
      return 1.0;
    case "lg":
      return 1.25;
    case "xl":
      return 1.5;
  }
  const n = parseFloat(stored);
  if (!Number.isFinite(n)) return 1;
  return clamp(n);
}

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [factor, setFactorState] = useState<number>(() => readStored());

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(CSS_VAR, String(factor));
  }, [factor]);

  function setFactor(next: number) {
    if (!Number.isFinite(next)) return;
    const clamped = clamp(next);
    localStorage.setItem(STORAGE_KEY, String(clamped));
    setFactorState(clamped);
  }

  return (
    <FontScaleContext.Provider value={{ factor, setFactor }}>
      {children}
    </FontScaleContext.Provider>
  );
}
