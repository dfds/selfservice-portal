import React, { useEffect, useState } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { SideSheet, SideSheetContent } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { getUsers } from "GraphApiClient";
import DropDownMenu from "components/DropDownMenu";

function TextWrapper(){
  return <>
  <div className=""></div>
  </>
}

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
  const [invitationsInput, setInvitationsInput] = useState("")
  const [invitees, setInvitees] = useState([]);
  const [isInviteesLoaded, setIsInviteesLoaded] = useState(false)

  useEffect(() => {
    console.log(invitationsInput);
    if (invitationsInput !== ""){
      setInvitees((prev) => ( [...prev, invitationsInput]));
    } 
  }, [invitationsInput])


  useEffect(() => {
    if(invitees.length !== 0){
      console.log(invitees)
    }

  },[invitees])

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
    const regex = /[^,]*$/;
    setIsUserSearchActive(true);
    const adValue = e?.target?.value.match(regex)[0].replace(/\s/g, '');
    const value = e?.target?.value;
    const newValue = value || emptyValues.invitations;
    setFormData((prev) => ({ ...prev, ...{ invitations: newValue } }));
    const adUserstest = await getUsers(adValue);
    setadUsers(adUserstest.value);
  }

  function updateInvitees(email) {
    // const newValue = email || emptyValues.invitations;
    // console.log(newValue);
    // console.log(formData);
    // const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    // console.log(formData.invitations[0]);
    // const result = formData.invitations[0].split(',').map(part => {
    //   console.log(part);
    //   const trimmedPart = part.trim();
    //   const isValidEmail = regex.test(trimmedPart);
    //   if (isValidEmail) {
    //     return trimmedPart
    //   }
      
    // }).filter(email => email);

    // console.log(result);
    
    // setFormData((prev) => ({ ...prev, invitations: [result, newValue] }));
    



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
      onAddCapabilityClicked(formData);
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
            onChange={(e)=>{changeInvitation(e)}}
          ></TextField>
          { isUserSearchActive ? 
            <div className={styles.dropDownMenu}>
              <DropDownMenu items={adUsers}
                setIsUserSearchActive={setIsUserSearchActive}
                setInvitationsInput={setInvitationsInput}
                />
            </div> : <></>}

          {
              (invitees || []).map((invitee) => (
                <div key={invitee}>{invitee}</div>
              )) 
          }

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
