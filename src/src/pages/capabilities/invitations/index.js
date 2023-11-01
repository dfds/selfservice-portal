import PageSection from "components/PageSection";
import { useState, useEffect } from "react";
import { TextField } from "@dfds-ui/react-components";
import { Search } from "@dfds-ui/icons/system";
import DropDownInvitationsMenu from "components/DropDownMenu";
import { getUsers } from "GraphApiClient";
import styles from "./../capabilities.module.css";
import { Button, ButtonStack } from "@dfds-ui/react-components";

export function Invitations({ addNewInvitees, inProgress }) {
  const [isUserSearchActive, setIsUserSearchActive] = useState(false);
  const [adUsers, setadUsers] = useState([]);
  const [invitationsInput, setInvitationsInput] = useState("");
  const [invitees, setInvitees] = useState([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (invitationsInput !== "") {
      setInvitees((prev) => [...prev, invitationsInput]);
    }
    setUserInput("");
  }, [invitationsInput]);

  async function changeInvitation(e) {
    e.preventDefault();
    const regex = /[^,]*$/; //takes all invitees separate them by comma and add them to an array
    setIsUserSearchActive(true);
    const adUsers = e?.target?.value.match(regex)[0];
    const value = e?.target?.value;
    const newValue = value || "";
    setUserInput(newValue);
    const adUserstest = await getUsers(adUsers);
    setadUsers(adUserstest.value);
  }

  const OnKeyEnter = (e) => {
    if (e.key === "Enter") {
      setInvitees((prev) => [...prev, userInput]);
      setUserInput("");
    }
  };

  const handleAddInvitationClicked = () => {
    addNewInvitees(invitees);
  };
  return (
    <>
      <PageSection headline="Invite members">
        <TextField
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
        <ButtonStack align="right">
          <Button
            size="small"
            variation="primary"
            onClick={handleAddInvitationClicked}
            submitting={inProgress}
            style={{ position: "right" }}
          >
            Add
          </Button>
        </ButtonStack>
      </PageSection>
    </>
  );
}
