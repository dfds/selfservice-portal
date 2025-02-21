import PageSection from "components/PageSection";
import { useState, useEffect, useContext } from "react";
import { ButtonStack } from "@dfds-ui/react-components";
import { Invitations } from "../invitations";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { TrackedButton } from "@/components/Tracking";

export function CapabilityInvitations() {
  const [invitees, setInvitees] = useState([]);
  const [isInvited, setIsInvited] = useState(false);
  const [showSuccessLabel, setShowSuccessLabel] = useState(false);
  const [disableSendButton, setDisableSendButton] = useState(true);
  const { addNewInvitees, isInviteesCreated, members } = useContext(
    SelectedCapabilityContext,
  );

  const handleAddInvitationClicked = async () => {
    if (invitees.length === 0) {
      return;
    }
    await addNewInvitees(invitees);
    setInvitees([]);
    setIsInvited(true);
    setShowSuccessLabel(true);
  };

  useEffect(() => {
    if (isInvited) {
      setTimeout(() => {
        setShowSuccessLabel(false);
        setDisableSendButton(true);
      }, 3000);
    }
  }, [isInvited, showSuccessLabel]);

  useEffect(() => {
    setDisableSendButton(true);
    if (invitees.length !== 0) {
      setDisableSendButton(false);
    }
  }, [invitees]);

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
          <TrackedButton
            trackName="Memberships-Invite"
            size="small"
            variation="primary"
            onClick={handleAddInvitationClicked}
            submitting={isInviteesCreated}
            style={{
              position: "right",
              backgroundColor: showSuccessLabel ? "#4caf50" : "#ED8800",
              cursor: disableSendButton ? "auto" : "pointer", //overwrite the build in style in order to prevent the user of clicking the button when it is green
              opacity: disableSendButton && !showSuccessLabel ? "0.3" : "",
              pointerEvents: showSuccessLabel ? "none" : "auto",
            }}
          >
            {showSuccessLabel ? "Success" : "Invite"}
          </TrackedButton>
        </ButtonStack>
      </PageSection>
    </>
  );
}
