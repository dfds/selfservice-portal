import React, { useState, useContext } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { TextField } from "@dfds-ui/react-components";
import AppContext from "AppContext";

export default function NewRepositoryDialog({ onClose }) {
  const [isCreatingNewRepository, setIsCreatingNewRepository] = useState(false);
  const { addNewRepository } = useContext(AppContext);

  const handleClose = () => {
    if (!isCreatingNewRepository) {
      onClose();
    }
  };

  const emptyValues = {
    name: "",
    description: "",
  };

  const [formData, setFormData] = useState(emptyValues);

  const changeName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || emptyValues.name;
    newName = newName.replace(/\s+/g, "/");

    setFormData((prev) => ({
      ...prev,
      ...{ name: newName.toLowerCase() },
    }));
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.description;
    setFormData((prev) => ({ ...prev, ...{ description: newValue } }));
  };

  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(_|-|\/|\.)$/g) &&
    !formData.name.match(/^(_|-|\/|\.)/g) &&
    !formData.name.match(/[-_/.\s]{2,}/g) &&
    !formData.name.match(/[^a-zA-Z0-9/\-_. ]/g);

  let nameErrorMessage = "";
  if (formData.name.length > 0 && !isNameValid) {
    nameErrorMessage =
      'Allowed characters are a-z, 0-9, ".", "-", "_", and "/". Repositories must not start or end with ".", "_", "-", or "/". Do not use more than one of ".", "-", "_", or "/" in a row.';
  }

  if (formData.name.length > 150) {
    nameErrorMessage = "Please consider a shorter name.";
  }

  const canAdd =
    formData.name !== "" &&
    formData.description !== "" &&
    nameErrorMessage === "";

  const handleAddRepositoryClicked = async () => {
    setIsCreatingNewRepository(true);
    await addNewRepository(formData);
    setIsCreatingNewRepository(false);
    onClose();
  };

  return (
    <>
      <SideSheet
        header={`Add new Repository`}
        onRequestClose={handleClose}
        isOpen={true}
        width="30%"
        alignSideSheet="right"
        variant="elevated"
        backdrop
      >
        <SideSheetContent>
          <TextField
            label="Name"
            placeholder="Enter name of repository"
            required
            value={formData.name}
            errorMessage={nameErrorMessage}
            onChange={changeName}
            maxLength={255}
          />

          <TextField
            label="Description"
            placeholder="Enter a description"
            required
            value={formData.description}
            onChange={changeDescription}
          />

          <ButtonStack>
            <Button
              size="small"
              variation="primary"
              onClick={handleAddRepositoryClicked}
              disabled={!canAdd}
              submitting={isCreatingNewRepository}
            >
              Add
            </Button>
            <Button size="small" variation="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </ButtonStack>
        </SideSheetContent>
      </SideSheet>
    </>
  );
}
