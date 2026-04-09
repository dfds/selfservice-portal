import React, { useState, useContext, useEffect } from "react";
import { useUpdateUserSettingsInformation } from "@/state/remote/queries/me";
import { SkeletonDemoAction } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import { InfoAlert } from "@/components/ui/InfoAlert";
import Page from "@/components/Page";
import styles from "./events.module.css";
import { TrackedButton } from "@/components/Tracking";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import RecordingsSection from "./RecordingsSection";
import EventSignupModal from "./EventSignupModal";

export default function EventsPage() {
  const [isSignedUp, setIsSignedUp] = useState(true);
  const { myUserSettings } = useContext(AppContext);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const { mutate: updateUserSettings } = useUpdateUserSettingsInformation();

  useEffect(() => {
    if (myUserSettings) {
      const signedUpForEvents = myUserSettings?.signedUpForDemos === true;
      setIsSignedUp(signedUpForEvents);
      setIsLoading(false);
    }
  }, [myUserSettings]);

  const toggleSignedUpForEvents = () => {
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
      <Page title="Cloud Engineering Events">
        {showSignupModal && (
          <EventSignupModal
            isOpen={showSignupModal}
            onClose={() => setShowSignupModal(false)}
          />
        )}
        <InfoAlert className="mb-4 animate-fade-up animate-stagger-1">
          <p className="font-semibold mb-1">Stay in the loop</p>
          <p className="mb-1">
            The cloud engineering team hosts events on a regular basis to
            showcase new features, tools, and best practices. All events are
            recorded and available on this page.
          </p>
          <p className="mb-3">
            Sign up below to receive invitations for future events.
          </p>
          <div className="flex gap-2 flex-wrap items-center">
            {isLoading ? (
              <SkeletonDemoAction />
            ) : (
              <>
                {!isSignedUp ? (
                  <TrackedButton
                    trackName="SignUpForEvents"
                    size="small"
                    onClick={() => toggleSignedUpForEvents()}
                  >
                    Sign Up For Future Events
                  </TrackedButton>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-[#4caf50] text-[13px]">
                      <CheckCircle size={16} />
                      You're signed up for event invitations
                    </span>
                    <TrackedButton
                      trackName="CancelSignUpForEvents"
                      variation="outlined"
                      size="small"
                      onClick={() => toggleSignedUpForEvents()}
                    >
                      Stop Receiving Event Invites
                    </TrackedButton>
                  </>
                )}
              </>
            )}
          </div>
          {isCloudEngineerEnabled && (
            <div className="mt-3 pt-3 border-t border-[rgba(14,124,193,0.2)] dark:border-[rgba(14,124,193,0.3)]">
              <TrackedButton
                trackName="ViewEventSignups"
                variation="outlined"
                size="small"
                onClick={() => setShowSignupModal(true)}
              >
                View Event Signups
              </TrackedButton>
            </div>
          )}
        </InfoAlert>
        <div className="animate-fade-up animate-stagger-2">
          <RecordingsSection />
        </div>
      </Page>
    </>
  );
}
