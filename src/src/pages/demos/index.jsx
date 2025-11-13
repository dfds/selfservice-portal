import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  CardMedia,
} from "@dfds-ui/react-components";
import { useUpdateUserSettingsInformation } from "@/state/remote/queries/me";
import { Text } from "@dfds-ui/typography";
import { StatusSuccess } from "@dfds-ui/icons/system";
import Page from "components/Page";
import SplashImage from "./demos.png";
import styles from "./demos.module.css";
import { TrackedButton } from "@/components/Tracking";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import RecordingsSection from "./RecordingsSection";
import DemoSignupModal from "./DemoSignupModal";

export default function DemosPage() {
  const [isSignedUp, setIsSignedUp] = useState(true);
  const { myUserSettings } = useContext(AppContext);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const { mutate: updateUserSettings } = useUpdateUserSettingsInformation();

  useEffect(() => {
    if (myUserSettings) {
      const signedUpForDemos = myUserSettings?.signedUpForDemos === true;
      setIsSignedUp(signedUpForDemos);
      setIsLoading(false);
    }
  }, [myUserSettings]);

  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

  const toggleSignedUpForDemos = () => {
    const newValue = !isSignedUp;
    setIsLoading(true);
    myUserSettings.signedUpForDemos = newValue;
    updateUserSettings(
      {
        signedUpForDemos: newValue,
      },
      {
        onSuccess: () => {
          setIsSignedUp(newValue);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <>
      <Page title="Cloud Engineering Demos">
        {showSignupModal && (
          <DemoSignupModal
            isOpen={showSignupModal}
            onClose={() => setShowSignupModal(false)}
          />
        )}
        <Card
          variant="fill"
          surface="main"
          size="xl"
          reverse={true}
          media={splash}
        >
          <CardTitle largeTitle>Stay in the loop</CardTitle>
          <CardContent>
            <p>
              The cloud engineering team hosts demo sessions on a regular basis
              in order to showcase new features, tools, and best practices.
              These sessions are designed to provide valuable insights and
              updates to our community.
            </p>
            <p>
              All our demos are recorded and will be made available on this
              page.
            </p>
            <p>
              By signing up for the demo sessions on this page, we will know to
              keep you in the loop going forward.
            </p>
          </CardContent>
          {isLoading ? (
            <CardActions>
              <Text>Loading...</Text>
            </CardActions>
          ) : (
            <CardActions>
              {!isSignedUp ? (
                <TrackedButton
                  trackName="SignUpForDemos"
                  size="small"
                  onClick={() => toggleSignedUpForDemos()}
                >
                  Sign Up For Future Demos
                </TrackedButton>
              ) : (
                <>
                  <Text
                    style={{ width: "100%", color: "green", fontSize: "16px" }}
                    className="signedUpMessage"
                  >
                    <StatusSuccess
                      style={{
                        width: "25px",
                        height: "25px",
                        marginRight: "4px",
                      }}
                    />
                    Great, you're signed up for demo invitations!
                  </Text>
                  <TrackedButton
                    trackName="CancelSignUpForDemos"
                    variation="outlined"
                    size="small"
                    onClick={() => toggleSignedUpForDemos()}
                  >
                    Stop Receiving Demo Invites
                  </TrackedButton>
                </>
              )}
            </CardActions>
          )}
          {isCloudEngineerEnabled && (
            <CardContent>
              <p>
                As a Cloud Engineer, you have access to the list of signups:
              </p>
              <TrackedButton
                trackName="ViewDemoSignups"
                variation="outlined"
                size="small"
                onClick={() => {
                  setShowSignupModal(true);
                }}
              >
                View Demo Signups
              </TrackedButton>
            </CardContent>
          )}
        </Card>
        <RecordingsSection />
      </Page>
    </>
  );
}
