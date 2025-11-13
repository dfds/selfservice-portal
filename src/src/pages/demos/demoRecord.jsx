import React from "react";
import DateFlag from "../../components/DateFlag/DateFlag";
import styles from "./demos.module.css";
import { Delete as DeleteIcon } from "@dfds-ui/icons/system";

export default function DemoRecord({ demo, isCloudEngineerEnabled, onClick }) {
  const { title, description, url, recordingDate } = demo;
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
          <DateFlag date={recordingDate} />
          <div>
            <h3 className={styles.title}>{title}</h3>
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
