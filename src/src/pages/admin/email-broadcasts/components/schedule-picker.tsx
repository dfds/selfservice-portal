import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarClock, Repeat } from "lucide-react";

type ScheduleType = "Immediate" | "Scheduled" | "Recurring";

interface SchedulePickerProps {
  scheduleType: ScheduleType;
  scheduledAt: string;
  cronExpression: string;
  onChange: (values: {
    scheduleType: ScheduleType;
    scheduledAt: string;
    cronExpression: string;
  }) => void;
  disabled?: boolean;
}

const CRON_PRESETS = [
  { label: "Daily 9 AM", value: "0 9 * * *" },
  { label: "Weekly Monday 9 AM", value: "0 9 * * 1" },
  { label: "Monthly 1st 9 AM", value: "0 9 1 * *" },
  { label: "Every Weekday 9 AM", value: "0 9 * * 1-5" },
];

export function SchedulePicker({
  scheduleType,
  scheduledAt,
  cronExpression,
  onChange,
  disabled,
}: SchedulePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  const modes: { value: ScheduleType; label: string; icon: React.ReactNode }[] =
    [
      {
        value: "Immediate",
        label: "Immediate",
        icon: <Clock size={14} />,
      },
      {
        value: "Scheduled",
        label: "Schedule Once",
        icon: <CalendarClock size={14} />,
      },
      {
        value: "Recurring",
        label: "Recurring",
        icon: <Repeat size={14} />,
      },
    ];

  return (
    <div className="space-y-3">
      <Label className="text-[12px] mb-2 block">Delivery Schedule</Label>

      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange({ scheduleType: mode.value, scheduledAt, cronExpression })
            }
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-md border cursor-pointer transition-colors ${
              scheduleType === mode.value
                ? "border-action bg-action/10 text-action"
                : "border-card bg-surface text-muted hover:text-secondary hover:border-secondary"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {scheduleType === "Scheduled" && (
        <div>
          <Label htmlFor="scheduled-at" className="text-[12px] mb-1 block">
            Send Date & Time (UTC)
          </Label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) =>
              onChange({ scheduleType, scheduledAt: e.target.value, cronExpression })
            }
            disabled={disabled}
          />
          <span className="text-[11px] text-muted mt-1 block">
            The broadcast will be sent at this time (UTC).
          </span>
        </div>
      )}

      {scheduleType === "Recurring" && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="cron-expression" className="text-[12px] mb-1 block">
              Cron Expression
            </Label>
            <div className="flex gap-2">
              <Input
                id="cron-expression"
                value={cronExpression}
                onChange={(e) =>
                  onChange({
                    scheduleType,
                    scheduledAt,
                    cronExpression: e.target.value,
                  })
                }
                placeholder="0 9 * * 1"
                className="font-mono"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                disabled={disabled}
                className="whitespace-nowrap text-[11px]"
              >
                Presets
              </Button>
            </div>
            <span className="text-[11px] text-muted mt-1 block">
              Standard 5-field cron: minute hour day-of-month month day-of-week
            </span>
          </div>

          {showPresets && (
            <div className="flex flex-wrap gap-1.5">
              {CRON_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange({
                      scheduleType,
                      scheduledAt,
                      cronExpression: preset.value,
                    });
                    setShowPresets(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-md border border-card bg-surface text-secondary hover:border-action hover:text-action cursor-pointer transition-colors"
                >
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5">
                    {preset.value}
                  </Badge>
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
