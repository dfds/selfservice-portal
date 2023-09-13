import React, { useState, useContext } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { TextField } from "@dfds-ui/react-components";
import { useECRRepositories } from "hooks/ECRRepositories";

export default function NewRepositoryDialog({
  onClose
}) {
  const [isCreatingNewRepository, setIsCreatingNewRepository] = useState(false);
  const { createRepository } = useECRRepositories();

  const handleClose = () => {
    if (!isCreatingNewRepository) {
      onClose();
    }
  };

  const emptyValues = {
    //name: "",
    description: "",
    repositoryName: "",
  };

  const [formData, setFormData] = useState(emptyValues);

  /*
  const changeName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || emptyValues.name;
    
    setFormData((prev) => ({ ...prev, ...{ name: newName.toLowerCase() } }));
  };
  */

  const changeRepositoryName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || emptyValues.repositoryName;
    newName = newName.replace(/\s+/g, "/");

    setFormData((prev) => ({ ...prev, ...{ repositoryName: newName.toLowerCase() } }));
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.description;
    setFormData((prev) => ({ ...prev, ...{ description: newValue } }));
  };
  /*
  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(_|-|\/)$/g) &&
    !formData.name.match(/^(_|-|\/)/g) &&
    !formData.name.match(/[-_\/\.]{2,}/g) &&
    !formData.name.match(/[^a-zA-Z0-9\/\-_]/g);

    let nameErrorMessage = "";
  if (formData.name.length > 0 && !isNameValid) {
    nameErrorMessage =
      'Allowed characters are a-z, 0-9, "-", "_", and " ". Names must not start or end with "_", "-", or "/". Do not use more than one of "-", "_", or "/" in a row.';
  }

  */
  const isRepositoryNameValid =
    formData.repositoryName !== "" &&
    !formData.repositoryName.match(/^\s*$/g) &&
    !formData.repositoryName.match(/(_|-|\/)$/g) &&
    !formData.repositoryName.match(/^(_|-|\/)/g) &&
    !formData.repositoryName.match(/[-_\/\.]{2,}/g) &&
    !formData.repositoryName.match(/[^a-zA-Z0-9\/\-_]/g);
  
  let repositoryNameErrorMessage = "";
  if (formData.repositoryName.length > 0 && !isRepositoryNameValid) {
    repositoryNameErrorMessage =
      'Allowed characters are a-z, 0-9, "-", "_", and "/". Repositories must not start or end with "_", "-", or "/". Do not use more than one of "-", "_", or "/" in a row.';
  }
  
  if (formData.repositoryName.length > 150) {
    repositoryNameErrorMessage = "Please consider a shorter name.";
  }

  const canAdd =
    //formData.name !== "" &&
    formData.description !== "" &&
    formData.repositoryName !== "" &&
    //nameErrorMessage === "" &&
    repositoryNameErrorMessage === "";

  const handleAddRepositoryClicked = async () => {
    setIsCreatingNewRepository(true);
    await createRepository(formData);
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
          {/*
          <div>
            <TextField
              label="Name"
              placeholder="Enter name of capability"
              required
              value={formData.name}
              onChange={changeName}
              errorMessage={nameErrorMessage}
              maxLength={255}
            />
          </div>
          */}
          <TextField
            label="Repository Name"
            placeholder="Enter a name for the new repository"
            required
            value={formData.repositoryName}
            onChange={changeRepositoryName}
            errorMessage={repositoryNameErrorMessage}
          ></TextField>

          <TextField
            label="Description"
            placeholder="Enter a description"
            required
            value={formData.description}
            onChange={changeDescription}
          ></TextField>

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
