import { useState } from "react";
import { TextField } from "@dfds-ui/react-components";
import { Search } from "@dfds-ui/icons/system";
import DropDownInvitationsMenu from "components/DropDownMenu";
import { getUsers } from "GraphApiClient";
import styles from "./../capabilities.module.css";

export function Invitations({
  addNewInvitees,
  invitees,
  setInvitees,
  formData,
  setFormData,
  members,
}) {
  const [isUserSearchActive, setIsUserSearchActive] = useState(false);
  const [adUsers, setaAdUsers] = useState([]);
  const [userInput, setUserInput] = useState("");

  const emptyValues = {
    name: "",
    description: "",
    invitations: [],
  };

  const emailValidator = (input) => {
    const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(input);
  };

  const userExists = (user) => {
    let result = invitees.some((e) => e === user);
    return result;
  };

  async function changeInvitation(e) {
    e.preventDefault();
    if (e?.target?.value === "") {
      setIsUserSearchActive(false);
    } else {
      setIsUserSearchActive(true);
    }
    const regex = /[^,]*$/; //takes all invitees separate them by comma and add them to an array
    const searchInput = e?.target?.value.match(regex)[0];
    const value = e?.target?.value;
    const newValue = value || "";
    setUserInput(newValue);
    if (formData) {
      setFormData((prev) => ({ ...prev, ...{ invitations: newValue } }));
    }
    if (searchInput) {
      const adUsersDropDown = await getUsers(searchInput);
      if (adUsersDropDown.value.length === 0) {
        setIsUserSearchActive(false);
      }
      if (members) {
        setaAdUsers(removeActiveMembers(members, adUsersDropDown.value));
      } else {
        setaAdUsers(adUsersDropDown.value);
      }
    }
  }

  const removeActiveMembers = (members, adOutput) => {
    let membersEmails = new Set();
    for (let member of members) {
      membersEmails.add(member.email);
    }
    const filteredArray = adOutput.filter((el) => {
      return !membersEmails.has(el.mail);
    });
    return filteredArray;
  };

  const addInvitee = (invitee) => {
    if (!userExists(invitee) && emailValidator(invitee)) {
      setInvitees((prev) => [...prev, invitee]);
      setUserInput("");
      setIsUserSearchActive(false);
      if (formData) {
        setFormData((prev) => ({
          ...prev,
          ...{ invitations: emptyValues.invitations },
        }));
      }
    }
  };

  const OnKeyEnter = (e) => {
    if (e.key === "Enter") {
      addInvitee(userInput);
    }
  };

  const addInviteeFromDropDown = (invitee) => {
    addInvitee(invitee);
  };

  const handleInviteeClicked = (invitee) => {
    setInvitees(invitees.filter((i) => i !== invitee));
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
            addInviteeFromDropDown={addInviteeFromDropDown}
          />
        </div>
      ) : (
        <></>
      )}
      <div className={styles.invitees_container}>
        {(invitees || []).map((invitee) => (
          <div
            className={styles.invitee_container}
            key={invitee}
            onClick={() => handleInviteeClicked(invitee)}
          >
            <div className={styles.invitee}>{invitee}</div>
            <div className={styles.delete_invitee_overlay}>X</div>
          </div>
        ))}
      </div>
    </>
  );
}
