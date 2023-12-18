import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import Members from "./members";
import Summary from "./summary";
import Costs from "./costs";
import Resources from "./resources";
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import MembershipApplications from "./membershipapplications";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";
import { CapabilityInvitations } from "./capabilityInvitations/capabilityInvitations";
import { JsonMetadataWithSchemaViewer } from "./jsonmetadata";
import { CapabilityTagViewer } from "./capabilityTags";
import JsonSchemaContext, { JsonSchemaProvider } from "../../JsonSchemaContext";

export default function CapabilityDetailsPage() {
  return (
    <>
      <SelectedCapabilityProvider>
        <JsonSchemaProvider>
          <CapabilityDetailsPageContent />
        </JsonSchemaProvider>
      </SelectedCapabilityProvider>
    </>
  );
}

function CapabilityDetailsPageContent() {
  const { id } = useParams();
  const {
    links,
    isLoading,
    isFound,
    name,
    kafkaClusters,
    loadCapability,
    showCosts,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    awsAccount,
    addNewInvitees,
    isInviteesCreated,
    members,
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    if (
      (links?.metadata?.allow || []).includes("GET") &&
      (links?.metadata?.allow || []).includes("POST")
    ) {
      setShowJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if ((links?.sendInvitations?.allow || []).includes("POST")) {
      setShowInvitations(true);
    }
  }, [links]);

  return (
    <>
      <DeletionWarning
        deletionState={isPendingDeletion}
        updateDeletionState={updateDeletionStatus}
      />
      <Page title={pagetitle} isLoading={isLoading} isNotFound={!isFound}>
        <Members />
        <Summary />

        <CapabilityTagViewer />

        {showJsonMetadata && <JsonMetadataWithSchemaViewer />}
        <Resources capabilityId={id} />

        {showInvitations && (
          <CapabilityInvitations
            addNewInvitees={addNewInvitees}
            inProgress={isInviteesCreated}
            invitees={[]}
            members={members}
          />
        )}

        <MembershipApplications />

        {/* <Logs /> */}
        {/* <CommunicationChannels /> */}

        {(kafkaClusters || []).map((cluster) => (
          <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={id} />
        ))}

        {showCosts && awsAccount !== undefined && <Costs />}
        {!isDeleted && (
          <CapabilityManagement
            deletionState={isPendingDeletion}
            updateDeletionState={updateDeletionStatus}
          />
        )}
      </Page>

      <br />
    </>
  );
}
