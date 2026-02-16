import React from "react";
import styles from "./demos.module.css";
import { Delete as DeleteIcon, Edit as EditIcon } from "@dfds-ui/icons/system";

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
  const { description, url, recordingDate } = demo;
  return (
    <a
      href={`${url}`}
      target="_blank"
      rel="noopener noreferrer"
      key={url}
      className={styles.rowLink}
    >
      <div className={styles.notePreview} key={url}>
        <div className={styles.row}>
          <div>
            <h3 className={styles.title}>{renderDate(recordingDate)}</h3>
            <p className={styles.description}>{description}</p>
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
    </a>
  );
}
