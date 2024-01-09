import React, { useContext } from "react";
import { Text } from "@dfds-ui/typography";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";

import styles from "./summary.module.css";
import { TextBlock } from "components/Text";
import { useState } from "react";
import { MyMembershipApplication } from "../membershipapplications";
import AppContext from "AppContext";

function JoinDialog({
  name,
  isSubmitting,
  onCloseRequested,
  onSubmitClicked,
  canBypassMembershipApplications,
  onBypassClicked,
}) {
  const actions = (
    <>
      <ModalAction
        actionVariation="primary"
        submitting={isSubmitting}
        onClick={onSubmitClicked}
      >
        Submit
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        disabled={isSubmitting}
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
        style={{ position: "absolute" }}
        heading={`Want to join...?`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseRequested}
        actions={actions}
      >
        <Text>
          <strong>Hey</strong>, so you wanna join <TextBlock>{name}</TextBlock>
          ...? Awesome! Apply for a membership by submitting your membership
          application for approval by existing capability members. When they
          approve, you become a member.
        </Text>
        <Text styledAs="caption">
          <i>
            <strong>Please note</strong> <br />
            Your membership application will expire after two weeks if it hasn't
            been approved by existing members.
          </i>
        </Text>
        {canBypassMembershipApplications && (
          <Button
            variation="danger"
            style={{ position: "absolute", bottom: "1rem" }}
            disabled={isSubmitting}
            onClick={onBypassClicked}
          >
            FORCE JOIN (CE)
          </Button>
        )}
      </Modal>
    </>
  );
}

function LeaveDialog({ name, isLeaving, onCloseRequested, onLeaveClicked }) {
  const actions = (
    <>
      <ModalAction
        actionVariation="primary"
        submitting={isLeaving}
        onClick={onLeaveClicked}
      >
        Leave
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        disabled={isLeaving}
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
        heading={`Are you sure you want to leave ${name}?`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseRequested}
        actions={actions}
      >
        <Text>
          <strong>Hey</strong>, so you wanna leave <TextBlock>{name}</TextBlock>
          ...? Are you sure? You will have to reapply for membership to regain
          access.
        </Text>
      </Modal>
    </>
  );
}

export default function Summary() {
  const {
    name,
    id,
    description,
    links,
    submitMembershipApplication,
    submitLeaveCapability,
    bypassMembershipApproval,
  } = useContext(SelectedCapabilityContext);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const canJoin = (links?.membershipApplications?.allow || []).includes("POST");
  const canLeave = (links?.leaveCapability?.allow || []).includes("POST");
  const canBypass = (links?.joinCapability?.allow || []).includes("POST");
  const { reloadUser } = useContext(AppContext);

  const handleSubmitClicked = async () => {
    setIsSubmitting(true);
    await submitMembershipApplication();
    setIsSubmitting(false);
    setShowJoinDialog(false);
  };

  const handleLeaveClicked = async () => {
    setIsLeaving(true);
    await submitLeaveCapability();
    reloadUser();
    setIsLeaving(false);
    setShowLeaveDialog(false);
  };

  const handleCloseRequested = () => {
    if (!isSubmitting) {
      setShowJoinDialog(false);
    }
  };

  const handleBypassClicked = async () => {
    await bypassMembershipApproval();
    reloadUser();
    setShowJoinDialog(false);
  };

  return (
    <PageSection headline="Summary">
      {showJoinDialog && (
        <JoinDialog
          name={name}
          isSubmitting={isSubmitting}
          onCloseRequested={handleCloseRequested}
          onSubmitClicked={handleSubmitClicked}
          canBypassMembershipApplications={canBypass}
          onBypassClicked={handleBypassClicked}
        />
      )}
      {showLeaveDialog && (
        <LeaveDialog
          name={name}
          isLeaving={isLeaving}
          onCloseRequested={() => {
            if (!isLeaving) {
              setShowLeaveDialog(false);
            }
          }}
          onLeaveClicked={handleLeaveClicked}
        />
      )}

      <div className={styles.container}>
        <div className={styles.column}>
          <Text styledAs={"smallHeadline"}>Name</Text>{" "}
          <span className={styles.breakwords}>{name}</span>
        </div>
        <div className={styles.column}>
          <Text styledAs={"smallHeadline"}>Root Id</Text>{" "}
          <span className={styles.breakwords}>{id}</span>
        </div>
        <div className={styles.column}>
          <Text styledAs={"smallHeadline"}>Description</Text>{" "}
          <span className={styles.breakwords}>{description}</span>
        </div>
        <div className={styles.column} style={{ paddingTop: "2rem" }}>
          <MyMembershipApplication />
          <ButtonStack align="right">
            {canJoin && (
              <Button onClick={() => setShowJoinDialog(true)}>Join</Button>
            )}

            {canLeave && (
              <Button
                variation="outlined"
                onClick={() => setShowLeaveDialog(true)}
              >
                Leave
              </Button>
            )}
          </ButtonStack>
        </div>
      </div>
      <br />
    </PageSection>
  );
}
