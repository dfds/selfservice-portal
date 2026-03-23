import React, { useContext, useEffect, useState } from "react";
import styles from "./capabilities.module.css";
import AppContext from "@/AppContext";
import NewCapabilityWizard from "./NewCapabilityWizard";
import CapabilitiesList from "./Capabilities";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import Page from "@/components/Page";
import { TabbedCapabilityMembershipManagement } from "./capabilityMembershipManagement";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { useTopBarActions } from "@/components/TopBar/TopBarActionsContext";

export default function CapabilitiesPage() {
  const { addNewCapability } = useContext(AppContext);
  const [showNewCapabilityWizard, setShowNewCapabilityWizard] = useState(false);
  const [isCreatingNewCapability, setIsCreatingNewCapability] = useState(false);
  const { reloadUser } = useContext(AppContext);
  const { setActions } = useTopBarActions();

  const handleAddCapability = async (formData) => {
    setIsCreatingNewCapability(true);
    const mergedObject = Object.assign(
      {},
      formData.mandatoryTags,
      formData.optionalTags,
    );
    const jsonMetadataString = JSON.stringify(mergedObject, null, 1);
    await addNewCapability(
      formData.name,
      formData.description,
      jsonMetadataString,
    );
    setShowNewCapabilityWizard(false);
    setIsCreatingNewCapability(false);
    reloadUser();
    setShowNewCapabilityWizard(false);
  };

  const startAddCapabilityWizard = () => {
    setShowNewCapabilityWizard(true);
  };

  useEffect(() => {
    setActions(
      <TrackedButton
        trackName="CapabilityWizard-Begin"
        size="sm"
        onClick={startAddCapabilityWizard}
      >
        New capability
      </TrackedButton>,
    );
    return () => setActions(null);
  }, []);

  return (
    <>
      <Page title="Capabilities">
        {showNewCapabilityWizard && (
          <NewCapabilityWizard
            inProgress={isCreatingNewCapability}
            onAddCapabilityClicked={handleAddCapability}
            onCloseClicked={() => setShowNewCapabilityWizard(false)}
          />
        )}

        <InfoAlert className="mb-4">
          <p className="mb-1">
            Capabilities should be named uniquely after their (business)
            capability. Avoid using team or project names. For more information{" "}
            <TrackedLink
              trackName="Wiki-Playbooks"
              href="https://wiki.dfds.cloud/playbooks"
            >
              head on over to the Playbooks.
            </TrackedLink>
          </p>
          <p className="mb-0">
            <strong>Please note:</strong> Capability security is our collective
            responsibility.{" "}
            <TrackedLink
              trackName="Wiki-SecurityKnowledgeBase"
              href="https://wiki.dfds.cloud/en/documentation/security/security-knowledge-base-documents"
            >
              Please visit our security documentation.
            </TrackedLink>
          </p>
        </InfoAlert>

        <TabbedCapabilityMembershipManagement />

        <br />

        <CapabilitiesList />
      </Page>
    </>
  );
}
