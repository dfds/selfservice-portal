import PageSection from "components/PageSection";
import { useState, useContext, useEffect, useCallback } from "react";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import { Search } from "@dfds-ui/icons/system";
import DropDownInvitationsMenu from "components/DropDownMenu";
import { getUsers } from "GraphApiClient";
import styles from "./../capabilities.module.css";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { useCapabilityInvitees } from "hooks/Capabilities";

export function Invitations({
  addNewInvitees,
  invitees,
  setInvitees,
  formData,
  setFormData,
}) {
  const [isUserSearchActive, setIsUserSearchActive] = useState(false);
  const [adUsers, setadUsers] = useState([]);
  const [invitationsInput, setInvitationsInput] = useState("");
  const [userInput, setUserInput] = useState("");

  const emptyValues = {
    name: "",
    description: "",
    invitations: [],
  };

  const userExists = (user) => {
    return invitees.some((e) => e === user);
  };

  useEffect(() => {
    if (invitationsInput !== "" && !userExists(invitationsInput)) {
      setInvitees((prev) => [...prev, invitationsInput]);
    }
    setUserInput("");
    if (formData) {
      setFormData((prev) => ({
        ...prev,
        ...{ invitations: emptyValues.invitations },
      }));
    }
  }, [invitationsInput]);

  async function changeInvitation(e) {
    e.preventDefault();
    const regex = /[^,]*$/; //takes all invitees separate them by comma and add them to an array
    setIsUserSearchActive(true);
    const adUsers = e?.target?.value.match(regex)[0];
    const value = e?.target?.value;
    const newValue = value || "";
    setUserInput(newValue);
    if (formData) {
      setFormData((prev) => ({ ...prev, ...{ invitations: newValue } }));
    }
    const adUsersDropDown = await getUsers(adUsers);
    if (adUsersDropDown.value.length === 0) {
      setIsUserSearchActive(false);
    }
    setadUsers(adUsersDropDown.value);
  }

  const OnKeyEnter = (e) => {
    if (e.key === "Enter") {
      if (!userExists(userInput)) {
        setInvitees((prev) => [...prev, userInput]);
        setUserInput("");
        if (formData) {
          setFormData((prev) => ({
            ...prev,
            ...{ invitations: emptyValues.invitations },
          }));
        }
      }
    }
  };

  const handleAddInvitationClicked = () => {
    addNewInvitees(invitees);
  };

  return (
    <>
      <TextField
        label="Invitations"
        placeholder="Enter user name"
        value={userInput}
        icon={<Search />}
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
    </>
  );
}
