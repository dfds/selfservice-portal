import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useUpcomingEvents } from "@/state/remote/queries/events";
import { Skeleton } from "@/components/ui/skeleton";

const EVENT_TYPE_LABELS = {
  demo: "Demo",
  workshop: "Workshop",
  informational: "Info",
  other: "Event",
};

const EVENT_TYPE_COLORS = {
  demo: { bg: "#e8f4fb", color: "#0e7cc1" },
  workshop: { bg: "#dcfce7", color: "#16a34a" },
  informational: { bg: "#ede9fe", color: "#6d28d9" },
  other: { bg: "#f1f5f9", color: "#64748b" },
};

function EventRow({ event, past = false }) {
  const date = new Date(event.eventDate);
  const colors = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.other;
  const label = EVENT_TYPE_LABELS[event.type] ?? "Event";

  return (
    <div className={past ? "opacity-65" : ""}>
      <div className="flex items-center gap-1.5">
        {past ? (
          <span className="inline-block font-mono text-[8px] font-semibold tracking-[0.06em] uppercase px-1 py-[1px] rounded-[3px] bg-surface-muted text-muted border border-divider">
            Past event
          </span>
        ) : (
          <span
            className="inline-block font-mono text-[8px] font-semibold tracking-[0.06em] uppercase px-1 py-[1px] rounded-[3px]"
            style={{ background: colors.bg, color: colors.color }}
          >
            {label}
          </span>
        )}
        <span className="font-mono text-[9px] text-[#afafaf] dark:text-[#64748b] tracking-[0.04em]">
          {format(date, "d MMM")}
        </span>
      </div>
      <Link
        to={`/events/v/${event.id}`}
        className={`block text-[12px] font-medium leading-[1.3] line-clamp-1 no-underline hover:underline ${
          past ? "text-muted" : "text-[#002b45] dark:text-[#e2e8f0]"
        }`}
      >
        {event.title}
      </Link>
    </div>
  );
}

export default function MiniUpcomingEvents() {
  const { data, isLoading } = useUpcomingEvents();

  const upcoming = data?.upcomingEvents ?? [];
  const latest = data?.latestHeldEvent ?? null;
  const next = upcoming[0] ?? null;

  return (
    <div className="bg-surface border border-card rounded-[8px] px-3 py-2.5 flex flex-col">
      <div className="font-mono text-[9px] font-semibold tracking-[0.08em] uppercase text-muted mb-2">
        Upcoming Events
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {isLoading ? (
          <Skeleton className="h-[34px] rounded-[5px]" />
        ) : !next && !latest ? (
          <p className="font-mono text-[10px] text-muted tracking-[0.03em]">
            No events scheduled.
          </p>
        ) : (
          <>
            {next && <EventRow event={next} />}
            {latest && <EventRow event={latest} past />}
          </>
        )}
      </div>
      <div className="pt-2">
        <Link
          to="/events"
          className="font-mono text-[10px] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          All events →
        </Link>
      </div>
    </div>
  );
}
