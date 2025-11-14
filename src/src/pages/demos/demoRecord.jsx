import React from "react";
import styles from "./demos.module.css";
import { Delete as DeleteIcon } from "@dfds-ui/icons/system";

function renderDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

export default function DemoRecord({ demo, isCloudEngineerEnabled, onClick }) {
  const {   description, url, recordingDate } = demo;
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
            <div className={styles.deleteButtonContainer}>
              <DeleteIcon
                className={styles.deleteButtonIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClick();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
