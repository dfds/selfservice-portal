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
import { CapabilityAdoptionLevel } from "./capabilityAdoptionLevel";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import Counter from "../../xstate/counter";
import countMachine from "../../xstate/CounterMachine";
import { useMachine } from "@xstate/react";
import { CounterMachineContext } from "../../index";
import KafkaClusters from "../../xstate/KafkaClusters";
import KafkaMessagesCounter from "components/KafkaMessagesCounter/KafkaMessagesCounter";
import AppContext from "AppContext";
import { onRender } from "../../index";
import { Profiler } from "@hrisy/tools";


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
    metadata,
    adoptionLevelInformation,
  } = useContext(SelectedCapabilityContext);
  const { user, updateCounter } = useContext(AppContext);

  // const [state, send] = useMachine(countMachine);
  const topics = CounterMachineContext.useSelector(
    (state) => state.context.topic,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  useEffect(() => {
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    updateCounter();
  }, []);

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
        <Members />
        <Summary />

        <CapabilityAdoptionLevel
          adoptionLevelInformation={adoptionLevelInformation}
        />

        <Counter />
        <Counter />

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

        {/* {(topics || []).map((cluster) => (
          <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={id} />
        ))} */}

        <Profiler title="KafkaMessageCounter">
          <KafkaMessagesCounter />
        </Profiler>
        <Profiler title="KafkaCluster">
          <KafkaClusters capabilityId={id} />
        </Profiler>

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
