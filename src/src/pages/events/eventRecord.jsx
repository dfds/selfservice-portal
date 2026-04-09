import React from "react";
import styles from "./events.module.css";
import {
  Trash2,
  Pencil,
  FileText,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

function renderDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

function getAttachmentIcon(type) {
  switch (type) {
    case "recording":
      return <Play className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
}

function getAttachmentLabel(attachmentType, description) {
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
  return (
    <div key={event.id}>
      <div className={styles.row}>
        <div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={styles.title}>
                {title || description || renderDate(eventDate)}
              </h3>
              {type && type !== "Demo" && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {type}
                </span>
              )}
            </div>
            <span className={`${styles.date} text-s text-muted mb-2`}>
              {renderDate(eventDate)}
            </span>
            {description && title && (
              <p className={`${styles.description} mb-3`}>{description}</p>
            )}
            {attachments.length > 0 && (
              <div className={`${styles.linksRow} mt-5`}>
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                    title={attachment.description || attachment.type}
                  >
                    {getAttachmentIcon(attachment.type)}
                    {getAttachmentLabel(
                      attachment.type,
                      attachment.description,
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {isCloudEngineerEnabled && (
          <div className={styles.iconButtonRow}>
            <div className={styles.editButtonContainer}>
              <Pencil
                className={styles.editButtonIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick();
                }}
              />
            </div>
            <div className={styles.deleteButtonContainer}>
              <Trash2
                className={styles.deleteButtonIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteClick();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
