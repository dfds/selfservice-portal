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
import { JsonMetadataWithSchemaViewer } from "./jsonmetadata";

export default function CapabilityDetailsPage() {
  return (
    <>
      <SelectedCapabilityProvider>
        <CapabilityDetailsPageContent />
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
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    loadCapability(id);
  }, [id, loadCapability]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  useEffect(() => {
    if (
      (links?.metadata?.allow || []).includes("GET") &&
      (links?.metadata?.allow || []).includes("POST")
    ) {
      setShowJsonMetadata(true);
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
        {showJsonMetadata && <JsonMetadataWithSchemaViewer />}
        <Resources capabilityId={id} />

        {/*<Invitations
          addNewInvitees={addNewInvitees}
          inProgress={isInviteesCreated}
        />*/}

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
