import React, { useState, useContext } from "react";
import { TextField } from "@dfds-ui/react-components";
import { Modal, ModalAction } from "@dfds-ui/modal";
import styles from "./demos.module.css";
import AppContext from "@/AppContext";

export default function DemoEditModal({ isOpen, onClose, demo }) {
  const { editDemoRecording } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: demo.title || "This is unused",
    description: demo.description || "",
    recordingUrl: demo.recordingUrl || "",
    slidesUrl: demo.slidesUrl || "",
    recordingDate: demo.recordingDate
      ? demo.recordingDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
  });
  const [descriptionError, setDescriptionError] = useState("");

  const changeDescription = (e) => {
    setFormData({ ...formData, description: e.target.value });
    if (e.target.value.trim() === "") {
      setDescriptionError("Description is required.");
    } else {
      setDescriptionError("");
    }
  };

  const handleRecordingDateChange = (evt) => {
    setFormData({ ...formData, recordingDate: evt.target.value });
  };

  return (
    <Modal
      heading={"Edit Demo Recording"}
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      showClose={true}
      fixedTopPosition={true}
      onRequestClose={onClose}
    >
      <label
        htmlFor="recordingDescription"
        className={styles.recordingDateLabel}
      >
        Description
      </label>
      <textarea
        id="recordingDescription"
        className={styles.recordingDescriptionInput}
        placeholder="Enter a description"
        required
        value={formData.description}
        onChange={changeDescription}
        errorMessage={descriptionError}
      ></textarea>
      <TextField
        label="Recording URL"
        placeholder="Enter the URL of the recording (e.g., YouTube link)"
        required
        value={formData.recordingUrl}
        onChange={(e) =>
          setFormData({ ...formData, recordingUrl: e.target.value })
        }
        maxLength={500}
      ></TextField>
      <TextField
        label="Slides URL"
        placeholder="Enter the URL of the slides (optional)"
        value={formData.slidesUrl}
        onChange={(e) =>
          setFormData({ ...formData, slidesUrl: e.target.value })
        }
        maxLength={500}
        style={{ marginTop: "1rem" }}
      ></TextField>
      <label htmlFor="recordingDate" className={styles.recordingDateLabel}>
        Recording Date
      </label>
      <input
        id="recordingDate"
        type="date"
        onChange={handleRecordingDateChange}
        value={formData.recordingDate}
        className={styles.recordingDateInput}
      ></input>

      <div style={{ height: "1rem" }}></div>
      <ModalAction
        style={{ float: "right", marginRight: "1rem" }}
        actionVariation="primary"
        onClick={async () => {
          // Basic validation
          let valid = true;
          if (formData.description.trim() === "") {
            setDescriptionError("Description is required.");
            valid = false;
          }

          if (!valid) return;

          // Prepare data
          const payload = {
            id: demo.id,
            title: formData.title,
            description: formData.description,
            recordingUrl: formData.recordingUrl,
            slidesUrl: formData.slidesUrl,
            recordingDate: formData.recordingDate,
          };

          // Call mutation
          editDemoRecording(payload);
          onClose();
        }}
      >
        Save Changes
      </ModalAction>
    </Modal>
  );
}
