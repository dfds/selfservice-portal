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
import { useSelector, useDispatch } from 'react-redux'
import Counter from "../../redux/counter";
import KafkaClusters from "../../redux/KafkaClusters";
import { updateCapabilityId, updateDetails } from "../../redux/capabilityState";

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
    // loadCapability,
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

  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
    // loadCapability(id);
    dispatch(updateCapabilityId(id));
  }, [id]);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [costCentre, setCostCentre] = useState("");

  

  // const clusters = useSelector(state => state.selectedCapability.topics)

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

        <Counter/>

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

        {/* {(clusters || []).map((cluster) => (
          <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={id} />
        ))} */}

        <KafkaClusters 
          capabilityId={id}
        />



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
