import React, { useState } from "react";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useDemoSignups } from "@/state/remote/queries/demos";
import { Text } from "@dfds-ui/typography";
import Select from "react-select";

export default function DemoSignupModal({ isOpen, onClose }) {
  const separatorOptions = [
    { value: "; ", label: "Separate by semicolon (;)" },
    { value: ", ", label: "Separate by comma (,)" },
  ];
  const [selectedSeparator, setSelectedSeparator] = useState(
    separatorOptions[0],
  );
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
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <div style={{ width: "250px" }}>
          <Select
            options={separatorOptions}
            value={selectedSeparator}
            onChange={(selection) => setSelectedSeparator(selection)}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ModalAction
          style={{ marginRight: "1rem" }}
          actionVariation="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(
              signups
                .map((signup) => signup.email)
                .join(selectedSeparator.value),
            );
          }}
        >
          Copy e-mails to clipboard
        </ModalAction>
      </div>
    </Modal>
  );
}
