import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import { TabbedMembersView } from "./members";
import Summary from "./summary";
import Costs from "./costs";
import Resources from "./resources";
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/typography";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";
import { TabbedCapabilityAdoptionLevel } from "./capabilityAdoptionLevel";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import { MetadataTabbedView } from "./metadataTabbedView";

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
    metadata,
    adoptionLevelInformation,
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [costCentre, setCostCentre] = useState("");

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

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      const parsedMetadata = JSON.parse(metadata);
      setCostCentre(parsedMetadata["dfds.cost.centre"]);
    }
  }, [metadata]);

  return (
    <>
      <DeletionWarning
        deletionState={isPendingDeletion}
        updateDeletionState={updateDeletionStatus}
      />
      <Page title={pagetitle} isLoading={isLoading} isNotFound={!isFound}>
        <Summary />

        <TabbedMembersView showInvitations={showInvitations} />

        <TabbedCapabilityAdoptionLevel />

        {showJsonMetadata && <MetadataTabbedView />}

        <Resources capabilityId={id} />

        {/* <Logs /> */}
        {/* <CommunicationChannels /> */}

        {!awsAccount && (
          <PageSection headline="Kafka Clusters">
            <Text>
              No AWS account is linked to this capability. Please link an AWS
              account to view Kafka clusters.
            </Text>
          </PageSection>
        )}
        {awsAccount !== undefined &&
          awsAccount &&
          (kafkaClusters || []).map((cluster) => (
            <KafkaCluster
              key={cluster.id}
              cluster={cluster}
              capabilityId={id}
            />
          ))}

        {showCosts && awsAccount !== undefined && (
          <Costs costCentre={costCentre} />
        )}

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
