import React, { useState } from "react";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Snowflake } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import GrinchIcon from "./GrinchIcon";
import { useRybbit } from "@/RybbitContext";
import { cn } from "@/lib/utils";
import {
  FESTIVE_STYLES,
  SNOWFALL_SEASON,
  SNOW_OPTIONS,
  type SnowLevel,
  type SnowSettings,
  useSnowSettings,
} from "@/context/SnowSettingsContext";

const LEVEL_ORDER: SnowLevel[] = ["low", "medium", "high"];

function LevelPicker({
  name,
  label,
  levels,
  value,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  levels: Record<SnowLevel, string>;
  value: SnowLevel;
  disabled: boolean;
  onChange: (level: SnowLevel) => void;
}) {
  const labelId = `ssu-snow-${name}-label`;
  return (
    <div>
      <span
        id={labelId}
        className="mb-1.5 block text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex items-center gap-0.5 rounded-[6px] bg-[#dde0e2] p-0.5 dark:bg-[#1e2d3d]"
      >
        {LEVEL_ORDER.map((level) => {
          const active = level === value;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(level)}
              className={cn(
                "flex-1 rounded-[4px] border-0 py-1 text-[0.6875rem] font-mono transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action/50 disabled:cursor-not-allowed",
                active
                  ? "bg-surface text-primary shadow-sm dark:bg-slate-600 dark:text-white"
                  : "bg-transparent text-muted enabled:cursor-pointer enabled:hover:text-secondary",
              )}
            >
              {levels[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SnowSettingsMenu() {
  const { settings, update, reset } = useSnowSettings();
  const { trackEvent } = useRybbit();
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);

  if (!SNOWFALL_SEASON) return null;

  const grinch = !settings.enabled;
  // Turning snow off preserves the saved lights preference.
  const lightsOn = settings.enabled && settings.lights;

  function change(patch: Partial<SnowSettings>) {
    update(patch);
    trackEvent("user:preference:snow", { ...settings, ...patch });
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-label="Christmas settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        {...getReferenceProps()}
        className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[6px] text-secondary hover:text-primary hover:bg-[#f2f2f2] dark:hover:bg-[#1e2d3d] border-0 bg-transparent cursor-pointer"
      >
        {grinch ? (
          <GrinchIcon />
        ) : (
          <Snowflake size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              aria-label="Christmas settings"
              className="z-[70]"
            >
              {/* Animate a child so the entrance transform preserves the
                  floating panel's positioning transform. */}
              <div className="w-[280px] max-h-[calc(100vh-72px)] overflow-y-auto rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter">
                <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
                  <label
                    htmlFor="ssu-snow-enabled"
                    className="text-[0.8125rem] font-medium text-primary cursor-pointer"
                  >
                    {grinch ? "Grinch mode" : "Let it snow"}
                  </label>
                  {/* Keep the accessible name stable so "off" always means
                      snow is disabled. */}
                  <Switch
                    id="ssu-snow-enabled"
                    aria-label="Let it snow"
                    checked={settings.enabled}
                    onCheckedChange={(enabled) => change({ enabled })}
                  />
                </div>

                <div
                  className={cn(
                    "flex flex-col gap-3 px-4 py-3 transition-opacity",
                    !settings.enabled && "opacity-50",
                  )}
                >
                  {(
                    Object.keys(SNOW_OPTIONS) as (keyof typeof SNOW_OPTIONS)[]
                  ).map((key) => (
                    <LevelPicker
                      key={key}
                      name={key}
                      label={SNOW_OPTIONS[key].label}
                      levels={SNOW_OPTIONS[key].levels}
                      value={settings[key]}
                      disabled={!settings.enabled}
                      onChange={(level) => change({ [key]: level })}
                    />
                  ))}

                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="ssu-snow-tumble"
                      className="text-[0.625rem] font-mono font-semibold uppercase tracking-[0.08em] text-muted"
                    >
                      3D tumble
                    </label>
                    <Switch
                      id="ssu-snow-tumble"
                      checked={settings.tumble}
                      disabled={!settings.enabled}
                      onCheckedChange={(tumble) => change({ tumble })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-divider px-4 py-3">
                  <div className={cn(grinch && "opacity-50")}>
                    <label
                      htmlFor="ssu-festive-lights"
                      className={cn(
                        "text-[0.8125rem] font-medium text-primary",
                        grinch ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                    >
                      Festive lights
                    </label>
                    <p className="text-[0.6875rem] text-muted">
                      Decorations along the menu edges
                    </p>
                  </div>
                  <Switch
                    id="ssu-festive-lights"
                    checked={lightsOn}
                    disabled={grinch}
                    onCheckedChange={(lights) => change({ lights })}
                  />
                </div>

                <div
                  role="radiogroup"
                  aria-label="Decoration style"
                  className={cn(
                    "flex flex-col gap-0.5 px-2 pb-2 transition-opacity",
                    !lightsOn && "opacity-50",
                  )}
                >
                  {FESTIVE_STYLES.map((style, i) => {
                    const active = settings.lightsStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={!lightsOn}
                        onClick={() => change({ lightsStyle: style.id })}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[6px] border-0 px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action/50 disabled:cursor-not-allowed",
                          active
                            ? "bg-surface-muted"
                            : "bg-transparent enabled:cursor-pointer enabled:hover:bg-surface-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "font-mono text-[0.625rem] font-semibold",
                            active ? "text-action" : "text-muted",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[0.75rem] font-medium text-primary">
                          {style.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-divider px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={reset}
                    className="border-0 bg-transparent p-0 text-[0.75rem] text-action hover:underline cursor-pointer"
                  >
                    Reset to defaults
                  </button>
                </div>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
