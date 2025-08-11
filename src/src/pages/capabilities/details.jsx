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
//import { TabbedCapabilityAdoptionLevel } from "./capabilityAdoptionLevel";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import { MetadataTabbedView } from "./metadataTabbedView";
import { CapabilityTagsPageSection } from "./capabilityTags";
import menustyles from "./menu.module.css";

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

  const handleHighlight = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add(menustyles.highlight);
    setTimeout(() => target.classList.remove(menustyles.highlight), 3000);
  };

  return (
    <>
      <div>
        <DeletionWarning
          deletionState={isPendingDeletion}
          updateDeletionState={updateDeletionStatus}
        />

        <nav className={menustyles.menu}>
          <a href="#summary" onClick={(e) => handleHighlight(e, "summary")}>
            Summary
          </a>
          <a href="#members" onClick={(e) => handleHighlight(e, "members")}>
            Members
          </a>
          <a href="#tags" onClick={(e) => handleHighlight(e, "tags")}>
            Tags
          </a>
          <a href="#resources" onClick={(e) => handleHighlight(e, "resources")}>
            Resources
          </a>
          <a href="#kafka" onClick={(e) => handleHighlight(e, "kafka")}>
            Kafka Clusters
          </a>
          {showCosts && (
            <a href="#costs" onClick={(e) => handleHighlight(e, "costs")}>
              Costs
            </a>
          )}
          <a
            href="#management"
            onClick={(e) => handleHighlight(e, "management")}
          >
            Management
          </a>
        </nav>

        <Page title={pagetitle} isLoading={isLoading} isNotFound={!isFound}>
          <Summary anchorId="summary" />

          <TabbedMembersView
            anchorId="members"
            showInvitations={showInvitations}
          />

          {/*<TabbedCapabilityAdoptionLevel />*/}

          {showJsonMetadata && <CapabilityTagsPageSection anchorId="tags" />}

          {/*showJsonMetadata && <MetadataTabbedView />*/}

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
          {awsAccount !== undefined &&
            awsAccount &&
            (kafkaClusters || []).map((cluster) => (
              <KafkaCluster
                anchorId="kafka"
                key={cluster.id}
                cluster={cluster}
                capabilityId={id}
              />
            ))}

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
