import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppContext from "@/AppContext";
import NewCapabilityWizard from "./NewCapabilityWizard";
import CapabilitiesList from "./Capabilities";
import { TrackedLink } from "@/components/Tracking";
import Page from "@/components/Page";
import { TabbedCapabilityMembershipManagement } from "./capabilityMembershipManagement";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { useTopBarActions } from "@/components/TopBar/TopBarActionsContext";
import { Button } from "@/components/ui/button";

export default function CapabilitiesPage() {
  const { addNewCapability } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNewCapabilityWizard, setShowNewCapabilityWizard] = useState(
    () => searchParams.get("new") === "true",
  );
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
    setActions(null);
    return () => setActions(null);
  }, [setActions]);

  return (
    <>
      <Page>
        <div className="flex items-start justify-between mb-6 gap-8 animate-fade-up">
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
              Capabilities
            </h1>
          </div>
          <div className="flex items-end pb-1">
            <Button variant="action" onClick={startAddCapabilityWizard}>
              + New capability
            </Button>
          </div>
        </div>

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
              className="text-action underline underline-offset-2 hover:no-underline"
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
              className="text-action underline underline-offset-2 hover:no-underline"
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
