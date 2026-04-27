import React from "react";
import { Link } from "react-router-dom";
import { useFrontpageEvents } from "@/state/remote/queries/events";
import { Calendar, Clock } from "lucide-react";

function formatEventDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const options = { month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);

  if (diffDays === 0) return `Today, ${formattedDate}`;
  if (diffDays === 1) return `Tomorrow, ${formattedDate}`;
  if (diffDays > 0 && diffDays <= 7)
    return `In ${diffDays} days, ${formattedDate}`;
  return formattedDate;
}

function EventCard({ event, isUpcoming }) {
  const content = (
    <div className="flex items-start gap-2 mb-1">
      {isUpcoming ? (
        <Calendar size={14} className="text-action mt-[2px] flex-shrink-0" />
      ) : (
        <Clock size={14} className="text-muted mt-[2px] flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-primary leading-[1.4] mb-0.5">
          {event.title || event.description}
        </div>
        <div className="text-[11px] text-muted">
          {isUpcoming ? formatEventDate(event.eventDate) : "Latest event"}
          {event.type && event.type !== "Demo" && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {event.type}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Link
      to="/events"
      className="block mb-3 last:mb-0 no-underline hover:opacity-80 transition-opacity"
    >
      {content}
    </Link>
  );
}

export default function UpcomingEvents() {
  const { data, isFetched, isError } = useFrontpageEvents();

  if (!isFetched) {
    return <div className="text-[13px] text-muted">Loading events...</div>;
  }

  if (isError) {
    return null;
  }

  const upcomingEvents = data?.upcomingEvents || [];
  const latestHeldEvent = data?.latestHeldEvent;

  return (
    <div>
      {upcomingEvents.length > 0 ? (
        <div className="mb-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} isUpcoming={true} />
          ))}
        </div>
      ) : (
        <div className="text-[13px] text-secondary leading-[1.6] mb-4">
          No upcoming events at the moment.
        </div>
      )}
      {latestHeldEvent && (
        <div className="border-t border-card pt-3">
          <div className="text-[11px] font-mono tracking-[0.05em] uppercase text-muted mb-2">
            Latest Event
          </div>
          <EventCard event={latestHeldEvent} isUpcoming={false} />
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-card">
        <Link
          to="/events"
          className="text-[12px] text-action hover:underline font-medium"
        >
          View all events →
        </Link>
      </div>
    </div>
  );
}
