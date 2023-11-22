import PageSection from "components/PageSection";
import { useState, useContext, useEffect, useCallback } from "react";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import { Search } from "@dfds-ui/icons/system";
import DropDownInvitationsMenu from "components/DropDownMenu";
import { getUsers } from "GraphApiClient";
import styles from "./../capabilities.module.css";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { useCapabilityInvitees } from "hooks/Capabilities";
import { Invitations } from "../invitations";

export function CapabilityInvitations({ addNewInvitees, inProgress }) {
  const [invitees, setInvitees] = useState([]);

  const handleAddInvitationClicked = () => {
    addNewInvitees(invitees);
  };

  return (
    <>
      <PageSection headline="Invite members">
        <Invitations
          addNewInvitees={addNewInvitees}
          invitees={invitees}
          setInvitees={setInvitees}
        />
        <ButtonStack align="right">
          <Button
            size="small"
            variation="primary"
            onClick={handleAddInvitationClicked}
            submitting={inProgress}
            style={{ position: "right" }}
          >
            Invite
          </Button>
        </ButtonStack>
      </PageSection>
    </>
  );
}
