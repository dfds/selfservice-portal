import React, { useContext } from "react";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/typography";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { Card, CardContent, ButtonStack } from "@dfds-ui/react-components";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { useState } from "react";
import { css } from "@emotion/react";
import AppContext from "../../../AppContext";
import { TrackedButton } from "@/components/Tracking";

function DeleteDialog({ onCloseRequested, onDeleteClicked }) {
  const actions = (
    <>
      {/*ModalActions does not support danger/warning variations currently*/}
      <ModalAction
        onClick={onDeleteClicked}
        css={css`
          color: #be1e2d;
          :hover {
            background-color: #f1a7ae;
            color: #be1e2d;
          }
        `}
      >
        Delete
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={onCloseRequested}
      >
        Cancel
      </ModalAction>
    </>
  );

  return (
    <>
      <Modal
        heading={`Are you certain you wish to delete this capability?`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseRequested}
        actions={actions}
      >
        <Text>
          <strong>Warning:</strong> You are about to request deletion of this
          capability. Deletion will commence after a 7 day period, during which
          it is possible to cancel the deletion request. Be aware, that all
          resources related to this capability will be removed permanently, once
          deletion begins.
        </Text>
      </Modal>
    </>
  );
}

export default function CapabilityManagement() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    links,
    submitDeleteCapability,
    isPendingDeletion,
    updateDeletionStatus,
  } = useContext(SelectedCapabilityContext);

  const { reloadUser } = useContext(AppContext);

  const canDeleteCapability = (
    links?.requestCapabilityDeletion?.allow || []
  ).includes("POST");

  const handleDeleteClicked = async () => {
    await submitDeleteCapability();
    updateDeletionStatus(true);
    setShowDeleteDialog(false);
    reloadUser();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {canDeleteCapability && (
        <PageSection headline="Capability Management">
          {showDeleteDialog && (
            <DeleteDialog
              onCloseRequested={() => {
                setShowDeleteDialog(false);
              }}
              onDeleteClicked={handleDeleteClicked}
            />
          )}
          <Card>
            {/*Show deletion option only if deletion is not already pending*/}
            {!isPendingDeletion && (
              <CardContent>
                <p>
                  Requesting the deletion of a capability will not immediately
                  delete neither the capability itself nor its related
                  resources. Deletion will commence after a 7 day period, during
                  which it is possible to cancel the deletion request.
                </p>
                <div style={{ paddingTop: "2rem" }}>
                  <ButtonStack align="right">
                    {
                      <TrackedButton
                        trackName="CapabilityDelete-ShowDialog"
                        variation="danger"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Delete Capability
                      </TrackedButton>
                    }
                  </ButtonStack>
                </div>
              </CardContent>
            )}
            {/*..otherwise show information around this*/}
            {isPendingDeletion && (
              <CardContent>
                <p>
                  Deletion of this capability is pending. No other management
                  actions are available at this time.
                </p>
              </CardContent>
            )}
          </Card>
        </PageSection>
      )}
    </>
  );
}
