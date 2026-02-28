import React, { useState, useContext, useEffect } from "react";
import { useUpdateUserSettingsInformation } from "@/state/remote/queries/me";
import { Text } from "@/components/ui/Text";
import { CheckCircle } from "lucide-react";
import { InfoAlert } from "@/components/ui/InfoAlert";
import Page from "components/Page";
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

  const toggleSignedUpForDemos = () => {
    const newValue = !isSignedUp;
    setIsLoading(true);
    myUserSettings.signedUpForDemos = newValue;
    updateUserSettings(
      {
        ...myUserSettings,
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
        <InfoAlert className="mb-4">
          <p className="font-semibold mb-1">Stay in the loop</p>
          <p className="mb-1">
            The cloud engineering team hosts demo sessions on a regular basis
            to showcase new features, tools, and best practices. All demos are
            recorded and available on this page.
          </p>
          <p className="mb-3">
            Sign up below to receive invitations for future demo sessions.
          </p>
          <div className="flex gap-2 flex-wrap items-center">
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <>
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
                    <span className="flex items-center gap-1.5 text-[#4caf50] text-[13px]">
                      <CheckCircle size={16} />
                      You're signed up for demo invitations
                    </span>
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
              </>
            )}
          </div>
          {isCloudEngineerEnabled && (
            <div className="mt-3 pt-3 border-t border-[rgba(14,124,193,0.2)] dark:border-[rgba(14,124,193,0.3)]">
              <TrackedButton
                trackName="ViewDemoSignups"
                variation="outlined"
                size="small"
                onClick={() => setShowSignupModal(true)}
              >
                View Demo Signups
              </TrackedButton>
            </div>
          )}
        </InfoAlert>
        <RecordingsSection />
      </Page>
    </>
  );
}
