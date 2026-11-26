import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRybbit } from "@/RybbitContext";
import {
  adventState,
  seasonYear,
  todayOrdinal,
  type AdventState,
} from "@/components/Festive/advent";

// Set to false outside the Christmas season.
export const SNOWFALL_SEASON = true;

const STORAGE_KEY = "ssu-snow-settings";

export type SnowLevel = "low" | "medium" | "high";

export type FestiveStyle = "status" | "ascii" | "candy" | "pixel";

export const FESTIVE_STYLES: { id: FestiveStyle; label: string }[] = [
  { id: "status", label: "Status LEDs" },
  { id: "ascii", label: "ASCII" },
  { id: "candy", label: "Candy cane" },
  { id: "pixel", label: "Pixel ferry" },
];

export interface SnowSettings {
  enabled: boolean;
  amount: SnowLevel;
  speed: SnowLevel;
  wind: SnowLevel;
  size: SnowLevel;
  tumble: boolean;
  lights: boolean;
  lightsStyle: FestiveStyle;
}

export const SNOW_OPTIONS: Record<
  Exclude<keyof SnowSettings, "enabled" | "tumble" | "lights" | "lightsStyle">,
  { label: string; levels: Record<SnowLevel, string> }
> = {
  amount: {
    label: "Amount",
    levels: { low: "Light", medium: "Normal", high: "Blizzard" },
  },
  speed: {
    label: "Speed",
    levels: { low: "Drift", medium: "Normal", high: "Fast" },
  },
  wind: {
    label: "Wind",
    levels: { low: "Calm", medium: "Breezy", high: "Gusty" },
  },
  size: {
    label: "Flake size",
    levels: { low: "Small", medium: "Normal", high: "Large" },
  },
};

export const SNOW_COUNT: Record<SnowLevel, number> = {
  low: 120,
  medium: 350,
  high: 900,
};
export const SNOW_SPEED: Record<SnowLevel, [number, number]> = {
  low: [0.3, 1.2],
  medium: [1.0, 3.0],
  high: [2.5, 6.0],
};
export const SNOW_WIND: Record<SnowLevel, [number, number]> = {
  low: [-0.3, 0.3],
  medium: [-0.5, 2.0],
  high: [-0.5, 5.0],
};
export const SNOW_RADIUS: Record<SnowLevel, [number, number]> = {
  low: [0.3, 1.5],
  medium: [0.5, 3.0],
  high: [1.5, 5.0],
};

// Default snow levels match the original overlay.
export const DEFAULT_SNOW_SETTINGS: SnowSettings = {
  enabled: true,
  amount: "medium",
  speed: "medium",
  wind: "high",
  size: "medium",
  tumble: true,
  lights: false,
  lightsStyle: "status",
};

const LEVELS: SnowLevel[] = ["low", "medium", "high"];

function readStored(): SnowSettings {
  const defaults = DEFAULT_SNOW_SETTINGS;
  let parsed: Partial<Record<keyof SnowSettings, unknown>>;
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
  } catch {
    return defaults;
  }
  const level = (v: unknown, fallback: SnowLevel) =>
    LEVELS.includes(v as SnowLevel) ? (v as SnowLevel) : fallback;
  const bool = (v: unknown, fallback: boolean) =>
    typeof v === "boolean" ? v : fallback;
  return {
    enabled: bool(parsed.enabled, defaults.enabled),
    amount: level(parsed.amount, defaults.amount),
    speed: level(parsed.speed, defaults.speed),
    wind: level(parsed.wind, defaults.wind),
    size: level(parsed.size, defaults.size),
    tumble: bool(parsed.tumble, defaults.tumble),
    lights: bool(parsed.lights, defaults.lights),
    lightsStyle: FESTIVE_STYLES.some((s) => s.id === parsed.lightsStyle)
      ? (parsed.lightsStyle as FestiveStyle)
      : defaults.lightsStyle,
  };
}

interface SnowSettingsContextValue {
  settings: SnowSettings;
  update: (patch: Partial<SnowSettings>) => void;
  reset: () => void;
  /** Season state for today in Copenhagen. */
  advent: AdventState;
}

const SnowSettingsContext = createContext<SnowSettingsContextValue>({
  settings: DEFAULT_SNOW_SETTINGS,
  update: () => {},
  reset: () => {},
  advent: adventState(todayOrdinal(), seasonYear()),
});

export function useSnowSettings(): SnowSettingsContextValue {
  return useContext(SnowSettingsContext);
}

function hasStoredSettings(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

// festiveLights is the effective state: lights only render while snow is on.
function snowTraits(s: SnowSettings, customised: boolean) {
  return {
    snowEnabled: s.enabled,
    snowAmount: s.amount,
    snowSpeed: s.speed,
    snowWind: s.wind,
    snowSize: s.size,
    snowTumble: s.tumble,
    festiveLights: s.enabled && s.lights,
    festiveLightsStyle: s.lightsStyle,
    snowCustomised: customised,
  };
}

export function SnowSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SnowSettings>(() => readStored());
  const { trackEvent, setTraits } = useRybbit();
  const snapshotSent = useRef(false);
  const [today, setToday] = useState(() => todayOrdinal());

  // Polls so an open tab moves to the next day after midnight.
  useEffect(() => {
    const id = window.setInterval(() => setToday(todayOrdinal()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const advent = adventState(today, seasonYear());

  // Records the loaded selection for users who never open the menu.
  // The ref keeps StrictMode's double effect run from sending it twice.
  useEffect(() => {
    if (!SNOWFALL_SEASON || snapshotSent.current) return;
    snapshotSent.current = true;
    const customised = hasStoredSettings();
    trackEvent("user:preference:snow:loaded", { ...settings, customised });
    setTraits(snowTraits(settings, customised));
  }, [trackEvent, setTraits, settings]);

  function update(patch: Partial<SnowSettings>) {
    const next = { ...settings, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
    trackEvent("user:preference:snow", {
      ...next,
      changed: Object.keys(patch).join(","),
    });
    setTraits(snowTraits(next, true));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SNOW_SETTINGS);
    trackEvent("user:preference:snow:reset", { ...DEFAULT_SNOW_SETTINGS });
    setTraits(snowTraits(DEFAULT_SNOW_SETTINGS, false));
  }

  return (
    <SnowSettingsContext.Provider value={{ settings, update, reset, advent }}>
      {children}
    </SnowSettingsContext.Provider>
  );
}
