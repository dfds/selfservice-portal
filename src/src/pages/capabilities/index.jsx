import React, { useContext, useState } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardMedia,
  CardActions,
} from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import AppContext from "AppContext";
import NewCapabilityWizard from "./NewCapabilityWizard";
import MyCapabilities from "./MyCapabilities";
import OtherCapabilities from "./OtherCapabilities";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import Page from "components/Page";
import SplashImage from "./splash.jpg";
import { TabbedCapabilityMembershipManagement } from "./capabilityMembershipManagement";

export default function CapabilitiesPage() {
  const { addNewCapability } = useContext(AppContext);
  const [showNewCapabilityWizard, setShowNewCapabilityWizard] = useState(false);
  const [isCreatingNewCapability, setIsCreatingNewCapability] = useState(false);
  const { reloadUser } = useContext(AppContext);

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
      formData.invitations,
      jsonMetadataString,
    );
    setShowNewCapabilityWizard(false);
    setIsCreatingNewCapability(false);
    reloadUser();
    setShowNewCapabilityWizard(false);
  };

  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

  const startAddCapabilityWizard = () => {
    setShowNewCapabilityWizard(true);
  };

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

        <Card
          variant="fill"
          surface="main"
          size="xl"
          reverse={true}
          media={splash}
        >
          <CardTitle largeTitle>Information</CardTitle>
          <CardContent>
            <p>
              Capabilities should be named uniquely after their (business)
              capability. Avoid using team or project names. For more
              information{" "}
              <TrackedLink
                trackName="Wiki-Playbooks"
                href="https://wiki.dfds.cloud/playbooks"
              >
                head on over to the Playbooks.
              </TrackedLink>
            </p>
            <p>
              <strong>Please note:</strong> Capability security is our
              collective responsibility.{" "}
              <TrackedLink
                trackName="Wiki-SecurityKnowledgeBase"
                href="https://wiki.dfds.cloud/en/documentation/security/security-knowledge-base-documents"
              >
                Please visit our security documentation.
              </TrackedLink>
            </p>
            <p>You can add a new capability by clicking the button below:</p>
          </CardContent>
          <CardActions>
            <TrackedButton
              trackName="CapabilityWizard-Begin"
              size="small"
              onClick={() => startAddCapabilityWizard()}
            >
              Add
            </TrackedButton>
          </CardActions>
        </Card>

        <TabbedCapabilityMembershipManagement />

        <br />

        <MyCapabilities />

        <br />

        <OtherCapabilities />
      </Page>
    </>
  );
}
