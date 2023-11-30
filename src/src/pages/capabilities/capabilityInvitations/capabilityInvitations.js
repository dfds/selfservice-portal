import PageSection from "components/PageSection";
import { useState } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
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
