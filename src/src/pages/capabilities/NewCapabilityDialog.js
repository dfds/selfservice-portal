import React, { useState, useContext, createRef, useEffect } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { Invitations } from "./invitations";
import { CapabilityTagsSubForm } from "./capabilityTags/capabilityTagsSubForm";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import AppContext from "../../AppContext";

export default function NewCapabilityDialog({
  inProgress,
  onAddCapabilityClicked,
  onCloseClicked,
}) {
  const { isAllWithValues, getValidationError } = useContext(AppContext);
  const [descriptionError, setDescriptionError] = useState("");
  const [nameError, setNameError] = useState("");

  const [invitees, setInvitees] = useState([]);
  const [metadataFormData, setMetadataFormData] = useState({});
  const [validMetadata, setValidMetadata] = useState(false);
  const formRef = createRef();

  const emptyValues = {
    name: "",
    description: "",
    invitations: [],
  };

  const [formData, setFormData] = useState(emptyValues);

  const handleClose = () => {
    if (onCloseClicked && !inProgress) {
      onCloseClicked();
    }
  };

  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(_|-)$/g) &&
    !formData.name.match(/^(_|-)/g) &&
    !formData.name.match(/[-_.]{2,}/g) &&
    !formData.name.match(/[^a-zA-Z0-9\-_]/g);

  let nameErrorMessage = "";
  if (formData.name.length > 0 && !isNameValid) {
    nameErrorMessage =
      'Allowed characters are a-z, 0-9, "-", and "_" and it must not start or end with "_" or "-". Do not use more than one of "-" or "_" in a row.';
  }
  if (formData.name.length > 150) {
    nameErrorMessage = "Please consider a shorter name.";
  }

  const checkRequiredFields = async () => {
    const allWithValues = isAllWithValues([
      formData.name,
      formData.description,
    ]);
    if (allWithValues && validMetadata) {
      return true;
    } else {
      setDescriptionError(
        getValidationError(formData.description, "Please write a description"),
      );
      setNameError(getValidationError(formData.name, "Please write a name"));
      return false;
    }
  };

  const changeName = (e) => {
    e.preventDefault();
    let newName = e?.target?.value || "";
    newName = newName.replace(/\s+/g, "-");

    setFormData((prev) => ({ ...prev, ...{ name: newName.toLowerCase() } }));
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || emptyValues.description;
    setFormData((prev) => ({ ...prev, ...{ description: newValue } }));
  };

  const handleAddCapabilityClicked = async () => {
    // calling the function twice because of weird ref behavior
    formRef.current.validateForm();
    formRef.current.validateForm();
    const validForm = await checkRequiredFields();
    if (validForm) {
      const jsonMetadataString = JSON.stringify(metadataFormData, null, 1);
      if (onAddCapabilityClicked) {
        onAddCapabilityClicked({
          ...formData,
          invitations: invitees,
          jsonMetadataString,
        });
      }
    }
  };

  useEffect(() => {
    let error = "";
    if (formData.description !== "") {
      error = getValidationError(
        formData.description,
        "Please write a description",
      );
    }
    setDescriptionError(error);
  }, [formData.description]);

  useEffect(() => {
    let error = "";
    if (formData.name !== "") {
      error = getValidationError(formData.name, "Please write a name");
    }
    setNameError(error);
  }, [formData.name]);

  return (
    <>
      <SideSheet
        header={`Add new Capability`}
        onRequestClose={handleClose}
        isOpen={true}
        width="30%"
        alignSideSheet="right"
        variant="elevated"
        backdrop
      >
        <SideSheetContent>
          <div className={styles.tooltipsection}>
            <div className={styles.tooltip}>
              <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'>
                {/* <Information /> */}
              </Tooltip>
            </div>
            <TextField
              label="Name"
              placeholder="Enter name of capability"
              required
              value={formData.name}
              onChange={changeName}
              errorMessage={nameErrorMessage ? nameErrorMessage : nameError}
              maxLength={255}
            />
          </div>

          <TextField
            label="Description"
            placeholder="Enter a description"
            required
            value={formData.description}
            onChange={changeDescription}
            errorMessage={descriptionError}
          ></TextField>

          <Invitations
            invitees={invitees}
            setInvitees={setInvitees}
            formData={formData}
            setFormData={setFormData}
          />

          <JsonSchemaProvider>
            <CapabilityTagsSubForm
              label="Capability Tags"
              setMetadata={setMetadataFormData}
              setHasSchema={() => {}}
              setValidMetadata={setValidMetadata}
              preexistingFormData={{}}
              formRef={formRef}
            />
          </JsonSchemaProvider>

          <br />

          <ButtonStack>
            <Button
              size="small"
              variation="primary"
              onClick={handleAddCapabilityClicked}
              submitting={inProgress}
            >
              Add
            </Button>
            <Button
              size="small"
              variation="outlined"
              onClick={handleClose}
              disabled={inProgress}
            >
              Cancel
            </Button>
          </ButtonStack>
        </SideSheetContent>
      </SideSheet>
    </>
  );
}
