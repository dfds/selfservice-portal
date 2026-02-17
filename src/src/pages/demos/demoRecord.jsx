import React from "react";
import styles from "./demos.module.css";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Document as DocumentIcon,
  Play as PlayIcon,
} from "@dfds-ui/icons/system";

function renderDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

export default function DemoRecord({
  demo,
  isCloudEngineerEnabled,
  onDeleteClick,
  onEditClick,
}) {
  const { description, recordingUrl, slidesUrl, recordingDate } = demo;
  return (
    <div key={demo.id}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.title}>{renderDate(recordingDate)}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.linksRow}>
            {recordingUrl && (
              <a
                href={recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                <PlayIcon style={{ fontSize: "1.1em" }} />
                Watch Recording
              </a>
            )}
            {slidesUrl && slidesUrl.trim() !== "" && (
              <a
                href={slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                <DocumentIcon style={{ fontSize: "1.1em" }} />
                View Slides
              </a>
            )}
          </div>
        </div>
        {isCloudEngineerEnabled && (
          <div className={styles.iconButtonRow}>
            <div className={styles.editButtonContainer}>
              <EditIcon
                className={styles.editButtonIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditClick();
                }}
              />
            </div>
            <div className={styles.deleteButtonContainer}>
              <DeleteIcon
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
