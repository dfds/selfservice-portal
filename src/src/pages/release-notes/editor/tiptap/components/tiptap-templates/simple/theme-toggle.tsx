"use client";

import { useTheme } from "@/context/ThemeContext";

// --- UI Primitives ---
import { Button } from "../../tiptap-ui-primitive/button";

// --- Icons ---
import { MoonStarIcon } from "../../tiptap-icons/moon-star-icon";
import { SunIcon } from "../../tiptap-icons/sun-icon";

export function ThemeToggle() {
  const { isDark, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {isDark ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  );
}
