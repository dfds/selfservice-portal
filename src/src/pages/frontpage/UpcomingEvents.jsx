import React from "react";
import { Link } from "react-router-dom";
import { useUpcomingEvents } from "@/state/remote/queries/events";
import { SkeletonNewsItem } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { formatEventDateTime } from "@/pages/events/eventDateTime";

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

function EventItem({ event, index = 0 }) {
  const colors = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.other;
  const label = EVENT_TYPE_LABELS[event.type] ?? "Event";

  return (
    <Link
      to={`/events/v/${event.id}`}
      className="block no-underline text-inherit py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0 animate-fade-up hover:bg-surface-muted transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-[3px]">
        <span
          className="inline-block font-mono text-[0.5625rem] font-semibold tracking-[0.06em] uppercase px-1.5 py-[1px] rounded-[4px]"
          style={{ background: colors.bg, color: colors.color }}
        >
          {label}
        </span>
        <span className="font-mono text-[0.625rem] text-[#afafaf] dark:text-[#64748b] tracking-[0.04em]">
          {formatEventDateTime(event.eventDate)}
        </span>
      </div>
      <div className="text-[0.8125rem] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-[1.4]">
        {event.title}
      </div>
    </Link>
  );
}

export default function UpcomingEvents() {
  const { data, isLoading } = useUpcomingEvents();

  if (isLoading) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <SkeletonNewsItem key={i} isFirst={i === 0} isLast={i === 2} />
        ))}
      </div>
    );
  }

  const upcoming = data?.upcomingEvents ?? [];

  if (!upcoming.length) {
    return (
      <p className="font-mono text-[0.6875rem] text-muted tracking-[0.03em]">
        No events scheduled.
      </p>
    );
  }

  return (
    <div>
      {upcoming.map((event, i) => (
        <EventItem key={event.id} event={event} index={i} />
      ))}
      <div className="pt-[0.625rem]">
        <Link
          to="/events"
          className="font-mono text-[0.6875rem] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          View all events →
        </Link>
      </div>
    </div>
  );
}
