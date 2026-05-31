import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Pencil,
  FileText,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { formatEventDateTime } from "./eventDateTime";

export function getAttachmentIcon(type) {
  switch (type) {
    case "recording":
      return <Play className="h-3.5 w-3.5" />;
    case "document":
      return <FileText className="h-3.5 w-3.5" />;
    case "image":
      return <ImageIcon className="h-3.5 w-3.5" />;
    default:
      return <LinkIcon className="h-3.5 w-3.5" />;
  }
}

export function getAttachmentLabel(attachmentType, description) {
  if (description) return description;
  switch (attachmentType) {
    case "Recording":
      return "Watch Recording";
    case "Document":
      return "View Document";
    case "Image":
      return "View Image";
    default:
      return "View Link";
  }
}

export default function EventRecord({
  event,
  isCloudEngineerEnabled,
  onDeleteClick,
  onEditClick,
}) {
  const { title, description, eventDate, type, attachments = [] } = event;
  const navigate = useNavigate();
  const handleRowClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }
    if (e.target.closest("a, button, [role='button']")) return;
    navigate(`/events/v/${event.id}`);
  };
  return (
    <div
      onClick={handleRowClick}
      className="group flex items-start gap-4 px-5 py-4 border-b border-divider last:border-0 hover:bg-surface-muted transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a
            href={`/events/v/${event.id}`}
            onClick={(e) => {
              if (
                e.defaultPrevented ||
                e.button !== 0 ||
                e.metaKey ||
                e.ctrlKey ||
                e.altKey ||
                e.shiftKey
              ) {
                return;
              }
              e.preventDefault();
              navigate(`/events/v/${event.id}`);
            }}
            className="no-underline text-[14px] font-semibold text-primary leading-snug group-hover:text-action transition-colors"
          >
            {title || description || formatEventDateTime(eventDate)}
          </a>
          {type && type !== "Demo" && (
            <span className="inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-[10px] tracking-[0.04em]">
              {type}
            </span>
          )}
        </div>
        {description && title && (
          <p className="text-[13px] text-secondary leading-relaxed line-clamp-2 mb-1.5 whitespace-pre-line">
            {description}
          </p>
        )}
        <div className="font-mono text-[11px] text-muted">
          {formatEventDateTime(eventDate)}
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-action hover:underline"
                title={attachment.description || attachment.type}
              >
                {getAttachmentIcon(attachment.type)}
                {getAttachmentLabel(attachment.type, attachment.description)}
              </a>
            ))}
          </div>
        )}
      </div>
      {isCloudEngineerEnabled && (
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <button
            aria-label={`Edit "${title || formatEventDateTime(eventDate)}"`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditClick();
            }}
            className="p-1.5 rounded-[5px] text-muted hover:text-action hover:bg-surface-subtle transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            aria-label={`Delete "${title || formatEventDateTime(eventDate)}"`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteClick();
            }}
            className="p-1.5 rounded-[5px] text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
