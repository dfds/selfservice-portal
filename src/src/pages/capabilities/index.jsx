import React, { useContext, useState } from "react";
import { Button } from "@dfds-ui/react-components";
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
import TrackingContext from "@/TrackingContext";
import { useTracking } from "@/hooks/Tracking";
import MyInvitations from "../../components/invitations/MyInvitations";
import OtherCapabilities from "./OtherCapabilities";
import { MembershipApplicationsUserCanApprove } from "./membershipapplications/index";
import { MyOutstandingMembershipApplications } from "./membershipapplications/myOutstandingApplications";
import Page from "components/Page";
import SplashImage from "./splash.jpg";

export default function CapabilitiesPage() {
  const { trackButtonClick } = useContext(TrackingContext);
  const { track } = useTracking();
  const { addNewCapability, myProfile } = useContext(AppContext);
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
    track({name: "BeginAddCapability", category: "Buttonclick"});
    trackButtonClick("BeginAddCapability");
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
              <a href="https://wiki.dfds.cloud/playbooks">
                head on over to the Playbooks.
              </a>
            </p>
            <p>
              <strong>Please note:</strong> Capability security is our
              collective responsibility.{" "}
              <a href="https://wiki.dfds.cloud/en/documentation/security/security-knowledge-base-documents">
                Please visit our security documentation.
              </a>
            </p>
            <p>You can add a new capability by clicking the button below:</p>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => startAddCapabilityWizard()}>
              Add
            </Button>
          </CardActions>
        </Card>

        <MyOutstandingMembershipApplications />
        <MembershipApplicationsUserCanApprove />

        {myProfile?._links?.invitationsLinks?.capabilityInvitations?.href && (
          <>
            <br />
            <MyInvitations
              invitationsLink={
                myProfile?._links?.invitationsLinks?.capabilityInvitations?.href
              }
            />
          </>
        )}
        <br />

        <MyCapabilities />

        <br />

        <OtherCapabilities />
      </Page>
    </>
  );
}
