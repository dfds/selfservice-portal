import React from "react";
import Page from "@/components/Page";
import { useEvent } from "@/state/remote/queries/events";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getAttachmentIcon, getAttachmentLabel } from "./eventRecord";
import { formatEventDateTime } from "./eventDateTime";
import LinkifiedText from "@/components/Text/LinkifiedText";

export function EventView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFetched, data: event } = useEvent(id);

  const attachments = event?.attachments ?? [];

  return (
    <Page title="">
      <button
        onClick={() => navigate("/events")}
        className="inline-flex items-center gap-1.5 mb-4 font-mono text-[0.75rem] text-muted hover:text-action transition-colors bg-transparent border-none p-0 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to events
      </button>

      {!isFetched ? (
        <div className="bg-surface border border-card rounded-[8px] px-6 py-6 animate-pulse">
          <div className="h-[20px] w-1/2 rounded bg-surface-muted mb-3" />
          <div className="h-[13px] w-1/4 rounded bg-surface-muted mb-6" />
          <div className="h-[13px] w-full rounded bg-surface-muted mb-2" />
          <div className="h-[13px] w-5/6 rounded bg-surface-muted" />
        </div>
      ) : !event ? (
        <div className="bg-surface border border-card rounded-[8px] px-5 py-12 text-center">
          <CalendarDays size={32} className="text-muted mx-auto mb-3" />
          <p className="text-[0.875rem] text-muted font-mono">
            Event not found
          </p>
        </div>
      ) : (
        <article className="bg-surface border border-card rounded-[8px] px-6 py-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-[1.375rem] font-semibold text-primary leading-tight">
              {event.title ||
                event.description ||
                formatEventDateTime(event.eventDate)}
            </h1>
            {event.type && event.type !== "Demo" && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shrink-0">
                {event.type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-muted mb-6">
            <CalendarDays size={13} />
            {formatEventDateTime(event.eventDate)}
          </div>

          {event.description && event.title && (
            <p className="text-[0.875rem] text-secondary leading-relaxed whitespace-pre-wrap mb-6">
              <LinkifiedText
                text={event.description}
                linkClassName="text-action underline"
              />
            </p>
          )}

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment: any, index: number) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[5px] border border-card bg-surface-muted px-3 py-2 text-[0.8125rem] text-primary no-underline hover:text-action hover:border-action transition-colors"
                  title={attachment.description || attachment.type}
                >
                  {getAttachmentIcon(attachment.type)}
                  {getAttachmentLabel(attachment.type, attachment.description)}
                </a>
              ))}
            </div>
          )}
        </article>
      )}
    </Page>
  );
}

export default EventView;
