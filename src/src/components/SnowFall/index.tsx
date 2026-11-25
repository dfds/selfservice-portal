import React from "react";
import SnowFall from "react-snowfall";
import { useTheme } from "@/context/ThemeContext";
import {
  SNOWFALL_SEASON,
  SNOW_COUNT,
  SNOW_RADIUS,
  SNOW_SPEED,
  SNOW_WIND,
  useSnowSettings,
} from "@/context/SnowSettingsContext";

export default function SnowFallOverlay() {
  const { isDark } = useTheme();
  const { settings } = useSnowSettings();
  if (!SNOWFALL_SEASON || !settings.enabled) return null;

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
      snowflakeCount={SNOW_COUNT[settings.amount]}
      speed={SNOW_SPEED[settings.speed]}
      wind={SNOW_WIND[settings.wind]}
      radius={SNOW_RADIUS[settings.size]}
      enable3DRotation={settings.tumble}
    />
  );
}
