import React, { useState } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { Invitations } from "./invitations";
import { CapabilityTagsSubForm } from "./capabilityTags/capabilityTagsSubForm";
import { JsonSchemaProvider } from "../../JsonSchemaContext";

export default function NewCapabilityDialog({
  inProgress,
  onAddCapabilityClicked,
  onCloseClicked,
}) {
  const handleClose = () => {
    if (onCloseClicked && !inProgress) {
      onCloseClicked();
    }
  };

  const emptyValues = {
    name: "",
    description: "",
    invitations: [],
  };

  const [formData, setFormData] = useState(emptyValues);
  const [invitees, setInvitees] = useState([]);
  const [metadataFormData, setMetadataFormData] = useState({});
  const [validMetadata, setValidMetadata] = useState(false);

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

  const canAdd =
    formData.name !== "" &&
    formData.description !== "" &&
    validMetadata &&
    nameErrorMessage === "";

  const handleAddCapabilityClicked = () => {
    const jsonMetadataString = JSON.stringify(metadataFormData, null, 1);
    if (onAddCapabilityClicked) {
      onAddCapabilityClicked({
        ...formData,
        invitations: invitees,
        jsonMetadataString,
      });
    }
  };

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
              errorMessage={nameErrorMessage}
              maxLength={255}
            />
          </div>

          <TextField
            label="Description"
            placeholder="Enter a description"
            required
            value={formData.description}
            onChange={changeDescription}
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
            />
          </JsonSchemaProvider>

          <br />

          <ButtonStack>
            <Button
              size="small"
              variation="primary"
              onClick={handleAddCapabilityClicked}
              disabled={!canAdd}
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
