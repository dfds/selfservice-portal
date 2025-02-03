import React, { useEffect, useState } from "react";
import {
  Button,
  SideSheet,
  SideSheetContent,
  TextField,
} from "@/dfds-ui/react-components/src";

export default function EditTopicDialog({
  originalTopic,
  inProgress,
  allowedToUpdate,
  onUpdateClicked,
  onCloseClicked,
}) {
  const [topicCopy, setTopicCopy] = useState({ id: "", description: "" });
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (topicCopy.id !== originalTopic.id) {
      setTopicCopy(originalTopic);
    }
  }, [originalTopic]);

  useEffect(() => {
    setNewDescription(topicCopy.description);
  }, [topicCopy]);

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || "";
    setNewDescription(newValue);
  };

  const handleUpdateClicked = () => {
    if (onUpdateClicked) {
      onUpdateClicked({
        description: newDescription,
      });
    }
  };

  const handleCloseClicked = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
  };

  const canUpdate = newDescription !== "" && !inProgress;

  return (
    <SideSheet
      header={`Edit topic ${topicCopy.name}`}
      onRequestClose={handleCloseClicked}
      isOpen={true}
      width="30%"
      alignSideSheet="right"
      variant="elevated"
      backdrop
    >
      <SideSheetContent>
        <TextField
          label="Description"
          placeholder="Enter a description"
          required
          value={newDescription}
          onChange={changeDescription}
        />

        <Button
          variation="primary"
          type="button"
          disabled={!allowedToUpdate && !canUpdate}
          submitting={inProgress}
          onClick={handleUpdateClicked}
        >
          Update
        </Button>
      </SideSheetContent>
    </SideSheet>
  );
}
