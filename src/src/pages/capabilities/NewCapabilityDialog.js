import React, { useEffect, useState } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { getUsers } from "GraphApiClient";
import DropDownInvitationsMenu from "components/DropDownMenu";
import { Search } from "@dfds-ui/icons/system";

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

  //error banner logic
  //const displayConflictWarning =

  const emptyValues = {
    name: "",
    description: "",
    invitations: [],
  };

  const [formData, setFormData] = useState(emptyValues);
  const [isUserSearchActive, setIsUserSearchActive] = useState(false);
  const [adUsers, setadUsers] = useState([]);
  const [invitationsInput, setInvitationsInput] = useState("");
  const [invitees, setInvitees] = useState([]);

  useEffect(() => {
    if (invitationsInput !== "") {
      setInvitees((prev) => [...prev, invitationsInput]);
    }
    setFormData((prev) => ({
      ...prev,
      ...{ invitations: emptyValues.invitations },
    }));
  }, [invitationsInput]);

  useEffect(() => {
    if (invitees.length !== 0) {
    }
  }, [invitees]);

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

  async function changeInvitation(e) {
    e.preventDefault();
    const regex = /[^,]*$/; //takes all invitees separate them by comma and add them to an array
    setIsUserSearchActive(true);
    const adUsers = e?.target?.value.match(regex)[0];
    const value = e?.target?.value;
    const newValue = value || emptyValues.invitations;
    setFormData((prev) => ({ ...prev, ...{ invitations: newValue } }));
    const adUserstest = await getUsers(adUsers);
    setadUsers(adUserstest.value);
  }

  const isNameValid =
    formData.name !== "" &&
    !formData.name.match(/^\s*$/g) &&
    !formData.name.match(/(_|-)$/g) &&
    !formData.name.match(/^(_|-)/g) &&
    !formData.name.match(/[-_\.]{2,}/g) &&
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
    nameErrorMessage === "";

  const handleAddCapabilityClicked = () => {
    if (onAddCapabilityClicked) {
      onAddCapabilityClicked({ ...formData, invitations: invitees });
    }
  };

  const OnKeyEnter = (e) => {
    if (e.key === "Enter") {
      if (Array.isArray(formData.invitations)) {
        return;
      } else {
        setInvitees((prev) => [...prev, formData.invitations]);
        setFormData((prev) => ({
          ...prev,
          ...{ invitations: emptyValues.invitations },
        }));
      }
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

          <TextField
            label="Invite members"
            placeholder="Enter users emails"
            required
            value={formData.invitations}
            icon= {Search}
            onChange={(e) => {
              changeInvitation(e);
            }}
            onKeyDown={OnKeyEnter}
          ></TextField>
          {isUserSearchActive ? (
            <div className={styles.dropDownMenu}>
              <DropDownInvitationsMenu
                items={adUsers}
                setIsUserSearchActive={setIsUserSearchActive}
                setInvitationsInput={setInvitationsInput}
              />
            </div>
          ) : (
            <></>
          )}
          <div className={styles.invitees_container}>
            {(invitees || []).map((invitee) => (
              <div className={styles.invitee_container} key={invitee}>
                {invitee}
              </div>
            ))}
          </div>

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
