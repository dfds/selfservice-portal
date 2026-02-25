import React, { useContext, useEffect, useState, useRef, act } from "react";
import { useParams, useLocation } from "react-router-dom";
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

import { CapabilityTagsPageSection } from "./capabilityTags";
import { AICatalogueSection } from "./aiCatalogue";
import RequirementsScore from "./RequirementsStatus";

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
  const { hash } = useLocation();
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
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showAICatalogueSection, setShowAICatalogueSection] = useState(false);
  const [costCentre, setCostCentre] = useState("");

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      const parsedMetadata = JSON.parse(metadata);
      const aiUsage = parsedMetadata["dfds.capability.contains-ai"];
      if (aiUsage === "true" || aiUsage === true) {
        setShowAICatalogueSection(true);
      } else {
        setShowAICatalogueSection(false);
      }
    }
  }, [metadata]);

  useEffect(() => {
    if ((links?.metadata?.allow || []).includes("GET")) {
      setShowJsonMetadata(true);
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
      <div>
        {/*<GrafanaWarning />*/}

        <DeletionWarning
          deletionState={isPendingDeletion}
          updateDeletionState={updateDeletionStatus}
        />

        <Page title={pagetitle} isLoading={isLoading} isNotFound={!isFound}>
          <Summary anchorId="summary" />

          <RequirementsScore />

          <TabbedMembersView anchorId="members" />

          {/*<TabbedCapabilityAdoptionLevel />*/}

          {showJsonMetadata && <CapabilityTagsPageSection anchorId="tags" />}

          {showAICatalogueSection && (
            <AICatalogueSection anchorId="ai-catalogue" />
          )}

          <Resources anchorId="resources" capabilityId={id} />

          {/* <Logs /> */}
          {/* <CommunicationChannels /> */}

          {!awsAccount && (
            <PageSection id="kafka" headline="Kafka Clusters">
              <Text>
                No AWS account is linked to this capability. Please link an AWS
                account to view Kafka clusters.
              </Text>
            </PageSection>
          )}
          <section id="kafka">
            {awsAccount !== undefined &&
              awsAccount &&
              (kafkaClusters || []).map((cluster) => (
                <KafkaCluster
                  key={cluster.id}
                  cluster={cluster}
                  capabilityId={id}
                />
              ))}
          </section>

          {showCosts && awsAccount !== undefined && (
            <Costs anchorId="costs" costCentre={costCentre} />
          )}

          {!isDeleted && (
            <CapabilityManagement
              anchorId="management"
              deletionState={isPendingDeletion}
              updateDeletionState={updateDeletionStatus}
            />
          )}
        </Page>
      </div>
      <br />
    </>
  );
}
