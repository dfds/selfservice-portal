import PageSection from "components/PageSection";
import { useState, useEffect } from "react";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import { Invitations } from "../invitations";

export function CapabilityInvitations({ addNewInvitees, inProgress, members }) {
  const [invitees, setInvitees] = useState([]);
  const [isInvited, setIsInvited] = useState(false);
  const [showDoneLabel, setShowDoneLabel] = useState(false);

  const handleAddInvitationClicked = async () => {
    await addNewInvitees(invitees);
    setInvitees([]);
    setIsInvited(true);
    setShowDoneLabel(true);
  };

  useEffect(() => {
    if (isInvited) {
      setTimeout(() => {
        setShowDoneLabel(false);
      }, 3000);
    }
  }, [isInvited, showDoneLabel]);

  return (
    <>
      <PageSection headline="Invite members">
        <Invitations
          addNewInvitees={addNewInvitees}
          invitees={invitees}
          setInvitees={setInvitees}
          isInvited={isInvited}
          members={members}
        />
        <ButtonStack align="right">
          <Button
            size="small"
            variation="primary"
            onClick={handleAddInvitationClicked}
            submitting={inProgress}
            style={{
              position: "right",
              backgroundColor: showDoneLabel ? "#4caf50" : "#ED8800",
            }}
          >
            {showDoneLabel ? "Success" : "Invite"}
          </Button>
        </ButtonStack>
      </PageSection>
    </>
  );
}
