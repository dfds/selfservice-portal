import React from "react";
import SnowFall from "react-snowfall";
import { useTheme } from "@/context/ThemeContext";

const SNOWFALL_SEASON = true;

export default function SnowFallOverlay() {
  const { isDark } = useTheme();
  if (!SNOWFALL_SEASON) return null;

  return (
    <SnowFall
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
      color={isDark ? "#ffffff" : "#94aed0"}
      opacity={isDark ? [1, 1] : [0.2, 0.5]}
      snowflakeCount={350}
      wind={[-0.5, 5]}
      enable3DRotation={true}
    />
  );
}
