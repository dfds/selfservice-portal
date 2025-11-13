import React from "react";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useDemoSignups } from "@/state/remote/queries/demos";
import { Text } from "@dfds-ui/typography";

export default function DemoSignupModal({ isOpen, onClose }) {
  const { isFetched: isFetchedSignups, data: signups } = useDemoSignups();

  return (
    <Modal
      heading={"Demo signups"}
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      showClose={true}
      fixedTopPosition={true}
      onRequestClose={onClose}
    >
      {!isFetchedSignups ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {signups && signups.length > 0 ? (
            <>
              {signups.map((signup) => (
                <Text key={signup.email}>
                  {signup.name} ({signup.email})
                </Text>
              ))}
            </>
          ) : (
            <Text>No one has signed up yet.</Text>
          )}
        </>
      )}
      <br />
      <ModalAction
        style={{ float: "right", marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(
            signups.map((signup) => signup.email).join(", "),
          );
        }}
      >
        Copy e-mails to clipboard
      </ModalAction>
    </Modal>
  );
}
