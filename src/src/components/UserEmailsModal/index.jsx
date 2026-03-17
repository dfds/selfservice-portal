import React, { useState } from "react";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { Text } from "@dfds-ui/typography";
import Select from "react-select";

export default function UserEmailsModal({
  isOpen,
  onClose,
  users,
  isLoading,
  onBack,
}) {
  const separatorOptions = [
    { value: "; ", label: "Separate by semicolon (;)" },
    { value: ", ", label: "Separate by comma (,)" },
  ];
  const [selectedSeparator, setSelectedSeparator] = useState(
    separatorOptions[0],
  );
  const emails = users ? users.map((user) => user.email).filter(Boolean) : [];

  return (
    <Modal
      heading={"User Emails"}
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      showClose={true}
      fixedTopPosition={true}
      onRequestClose={onClose}
    >
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {emails && emails.length > 0 ? (
            <>
              {users.map((user, index) => (
                <Text key={index}>
                  {user.name || user.email} ({user.email})
                </Text>
              ))}
            </>
          ) : (
            <Text>No users found.</Text>
          )}
        </>
      )}
      <br />
      {emails && emails.length > 0 && (
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
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {onBack && (
          <ModalAction actionVariation="outlined" onClick={onBack}>
            Back to Filters
          </ModalAction>
        )}
        {emails && emails.length > 0 && (
          <ModalAction
            style={{ marginLeft: "auto", marginRight: "1rem" }}
            actionVariation="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(
                emails.join(selectedSeparator.value),
              );
            }}
          >
            Copy e-mails to clipboard
          </ModalAction>
        )}
      </div>
    </Modal>
  );
}
