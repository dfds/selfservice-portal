import React, { useState, useContext, useEffect } from "react";
import { ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { TextField } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import { TrackedButton } from "@/components/Tracking";
import styles from "./releasenotes.module.css";
import Editor from "./editor/editor2";

export default function NewReleaseNoteDialog({ onClose }) {
  const [isCreatingNewReleaseNote, setIsCreatingNewReleaseNote] = useState(false);
  const { addNewReleaseNote, isAllWithValues, getValidationError } =
    useContext(AppContext);
  const [contentError, setContentError] = useState("");
  const [titleError, setTitleError] = useState("");

  const handleClose = () => {
    if (!isCreatingNewReleaseNote) {
      onClose();
    }
  };

  const emptyValues = {
    title: "",
    content: "",
    releaseDate: new Date().toISOString().split("T")[0], // Default to today's date
  };

  const [formData, setFormData] = useState(emptyValues);

  const changeTitle = (e) => {
    e.preventDefault();
    let newTitle = e?.target?.value || emptyValues.title;

    setFormData((prev) => ({
      ...prev,
      ...{ title: newTitle },
    }));
  };

  const changeContent = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.content;
    setFormData((prev) => ({ ...prev, ...{ content: newValue } }));
  };

  const handleAddReleaseNoteClicked = async () => {
    setIsCreatingNewReleaseNote(true);
    const validForm = await checkRequiredFields();
    if (validForm) {
      await addNewReleaseNote(formData);
      onClose();
    }

    setIsCreatingNewReleaseNote(false);
  };

  useEffect(() => {
    let error = "";
    if (formData.title !== "") {
      error = getValidationError(formData.title, "Please write a title");
    }
    setTitleError(error);
  }, [formData.title]);

  useEffect(() => {
    let error = "";
    if (formData.content !== "") {
      error = getValidationError(
        formData.content,
        "Please write content for the release note",
      );
    }
    setContentError(error);
  }, [formData.content]);

  const checkRequiredFields = async () => {
    const allWithValues = isAllWithValues([
      formData.title,
      formData.content,
      formData.releaseDate,
    ]);
    if (allWithValues) {
      return true;
    } else {
      setContentError(
        getValidationError(formData.content, "Please write content for the release note"),
      );
      setTitleError(getValidationError(formData.title, "Please write a title"));
      return false;
    }
  };

  return (
    <>
      <SideSheet
        header={`Add new Release Note`}
        onRequestClose={handleClose}
        isOpen={true}
        width="30%"
        alignSideSheet="right"
        variant="elevated"
        backdrop
      >
        <SideSheetContent>
          <TextField
            label="Title"
            placeholder="Enter title of release note"
            required
            value={formData.title}
            errorMessage={titleError ? titleError : ""}
            onChange={changeTitle}
            maxLength={255}
          />

          <label className={styles.label}>Release Date</label>
          <input
            type="date"
            value={formData.releaseDate || ""}
            className={`${styles.input} ${styles.inputBorder}`}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
          />

          <TextField
            label="Content"
            placeholder="Enter content for the release note"
            required
            value={formData.content}
            onChange={changeContent}
            errorMessage={contentError}
          />

          <ButtonStack>
            <TrackedButton
              trackName="ReleaseNoteCreate-Confirm"
              size="small"
              variation="primary"
              onClick={handleAddReleaseNoteClicked}
              submitting={isCreatingNewReleaseNote}
            >
              Add
            </TrackedButton>
            <TrackedButton
              trackName="ReleaseNoteCreate-Cancel"
              size="small"
              variation="outlined"
              onClick={handleClose}
              disabled={isCreatingNewReleaseNote}
            >
              Cancel
            </TrackedButton>
          </ButtonStack>
        </SideSheetContent>
      </SideSheet>
    </>
  );
}
