import React, { useState, useContext } from "react";
import { TextField } from "@dfds-ui/react-components";
import { Modal, ModalAction } from "@dfds-ui/modal";
import styles from "./demos.module.css";
import AppContext from "@/AppContext";

export default function DemoRegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    recordingUrl: "",
    recordingDate: new Date().toISOString().split("T")[0],
  });
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const changeName = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (e.target.value.trim() === "") {
      setNameError("Title is required.");
    } else {
      setNameError("");
    }
  };

  const changeDescription = (e) => {
    setFormData({ ...formData, description: e.target.value });
    if (e.target.value.trim() === "") {
      setDescriptionError("Description is required.");
    } else {
      setDescriptionError("");
    }
  };

  const handleRecordingDateChange = (evt) => {
    console.log("Selected recording date:", evt.target.value);
    setFormData({ ...formData, recordingDate: evt.target.value });
  };

  const { addNewDemoRecording } = useContext(AppContext);

  return (
    <Modal
      heading={"Register Demo Recording"}
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      showClose={true}
      fixedTopPosition={true}
      onRequestClose={onClose}
    >
      <TextField
        label="Title"
        placeholder="Enter a title for the demo recording"
        required
        value={formData.name}
        onChange={changeName}
        errorMessage={nameError}
        maxLength={255}
      />
      <TextField
        label="Description"
        placeholder="Enter a description"
        required
        value={formData.description}
        onChange={changeDescription}
        errorMessage={descriptionError}
      ></TextField>
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
          if (formData.name.trim() === "") {
            setNameError("Name is required.");
            valid = false;
          }
          if (formData.description.trim() === "") {
            setDescriptionError("Description is required.");
            valid = false;
          }

          if (!valid) return;

          // Prepare data
          const payload = {
            title: formData.name,
            description: formData.description,
            url: formData.recordingUrl,
            recordingDate: formData.recordingDate,
          };

          // Call mutation
          addNewDemoRecording(payload);
          onClose();
        }}
      >
        Register Demo
      </ModalAction>
    </Modal>
  );
}
