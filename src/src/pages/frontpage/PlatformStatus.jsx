import React from "react";
import { Lightbulb } from "lucide-react";
import { useStatuspageStatus } from "@/state/remote/queries/statuspage";

const STATUS_COLOR = {
  operational: "#22c55e",
  recently_resolved: "#eab308",
  degraded: "#ef4444",
  loading: "#d1d5db",
  error: "#d1d5db",
};

const STATUS_TOOLTIP = {
  operational: "Operational",
  recently_resolved: "Operational — had an incident in the past 2 hours",
  degraded: "Degraded or outage",
  loading: "Loading…",
  error: "Status unavailable",
};

export default function PlatformStatus() {
  const services = useStatuspageStatus();

  return (
    <div>
      <a
        href="https://dfdsit.statuspage.io"
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[11px] text-muted hover:text-primary transition-colors no-underline block mb-3"
      >
        dfdsit.statuspage.io ↗
      </a>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {services.map(({ id, label, status }) => (
          <div
            key={id}
            className="flex items-center gap-1.5"
            title={STATUS_TOOLTIP[status]}
          >
            <Lightbulb
              size={13}
              style={{ color: STATUS_COLOR[status], fill: STATUS_COLOR[status] }}
              className="flex-shrink-0"
            />
            <span className="text-[12px] text-secondary leading-none truncate">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
