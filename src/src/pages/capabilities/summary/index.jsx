import React, { useContext, useEffect } from "react";
import { Text } from "@dfds-ui/typography";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { ButtonStack } from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";

import styles from "./summary.module.css";
import { TextBlock } from "components/Text";
import { useState } from "react";
import { MyMembershipApplication } from "../membershipapplications";
import AppContext from "AppContext";
import { TrackedButton } from "@/components/Tracking";

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
          <TrackedButton
            trackName="CapabilityMembership-ForceJoin"
            variation="danger"
            style={{ position: "absolute", bottom: "1rem" }}
            disabled={isSubmitting}
            onClick={onBypassClicked}
          >
            FORCE JOIN (CE)
          </TrackedButton>
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

export default function Summary({ anchorId }) {
  const {
    name,
    createdAt,
    createdBy,
    id,
    description,
    links,
    submitMembershipApplication,
    submitLeaveCapability,
    bypassMembershipApproval,
    reloadMembers,
  } = useContext(SelectedCapabilityContext);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  var canJoin = (links?.membershipApplications?.allow || []).includes("POST");
  var canLeave = (links?.leaveCapability?.allow || []).includes("POST");
  var canBypass = (links?.joinCapability?.allow || []).includes("POST");
  const { reloadUser } = useContext(AppContext);

  useEffect(() => {
    canJoin = (links?.membershipApplications?.allow || []).includes("POST");
    canLeave = (links?.leaveCapability?.allow || []).includes("POST");
    canBypass = (links?.joinCapability?.allow || []).includes("POST");
  }, [links]);

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

  const asDate = (dateString) => {
    let millis = Date.parse(dateString);
    let date = new Date(millis);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PageSection id={anchorId} headline="Summary">
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
          <Text styledAs={"smallHeadline"}>Creation</Text>{" "}
          <span className={styles.breakwords}>
            {asDate(createdAt)}, by {createdBy}
          </span>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.doubleColumn}>
          <Text styledAs={"smallHeadline"}>Description</Text>{" "}
          <span className={styles.breakwords}>{description}</span>
        </div>
        <div className={styles.column} style={{ paddingTop: "2rem" }}>
          <MyMembershipApplication />
          <ButtonStack align="right">
            {canJoin ? (
              <TrackedButton
                trackName="CapabilityMembership-SendApplication"
                onClick={() => setShowJoinDialog(true)}
              >
                Join
              </TrackedButton>
            ) : (
              <TrackedButton
                trackName="CapabilityMembership-Leave"
                variation="outlined"
                disabled={!canLeave}
                onClick={() => setShowLeaveDialog(true)}
              >
                Leave
              </TrackedButton>
            )}
          </ButtonStack>
        </div>
      </div>
      <br />
    </PageSection>
  );
}
