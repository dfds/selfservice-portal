import React, { useContext, useEffect } from "react";
import PageSection from "components/PageSection";
import styles from "./selfAssessment.module.css";
import { Card, CardContent, Button } from "@dfds-ui/react-components";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { useState } from "react";
import {
  StatusSuccess,
  StatusAlert,
  Information,
  Help,
} from "@dfds-ui/icons/system";
import { useSelfServiceRequest } from "../../../hooks/SelfServiceApi";
import { set } from "date-fns";

export default function SelfAssessments() {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const { inProgress: assessmentInProgress, sendRequest: modifyAssessment } =
    useSelfServiceRequest();
  const [assessments, setAssessments] = useState([]);
  const [reloadAssessments, setReloadAssessments] = useState(true);
  const [showAssessmentsSection, setShowAssessmentsSection] = useState(false);
  const { links, setReloadConfigurationLevelInformation } = useContext(
    SelectedCapabilityContext,
  );
  
  useEffect(() => {
    if (assessmentInProgress === false) {
      setReloadAssessments(true);
    }
  }, [assessmentInProgress]);

  useEffect(() => {
    if (
      responseData?.selfAssessments &&
      responseData?.selfAssessments.length >= 0
    ) {
      setAssessments(responseData?.selfAssessments || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (
      links?.selfAssessments &&
      (links?.selfAssessments.allow || []).includes("GET")
    ) {
      sendRequest({
        urlSegments: [links.selfAssessments.href],
      });
      setReloadAssessments(false);
    }
  }, [reloadAssessments]);

  useEffect(() => {
    if (assessments.length > 0) {
      setShowAssessmentsSection(true);
    }
  }, [assessments]);

  const handleToggle = (assessment, desiredStatus) => {
    let link = assessment._links?.updateSelfAssessment?.href;
    if (link) {
      console.log("Toggling assessment", assessment, desiredStatus);
      modifyAssessment({
        urlSegments: [link],
        method: "POST",
        payload: {
          SelfAssessmentOptionId: assessment.id,
          SelfAssessmentStatus: desiredStatus,
        },
      });
      // The following is a hack to reload configuration level information
      // a while after the assessment has been toggled.
      // This allows multiple toggles to be done in quick succession
      // without bothering with cancelling requests
      setTimeout(() => {
        setReloadConfigurationLevelInformation(true);
        setReloadAssessments(true);
      }, 2000);
    } else {
      console.error("No link found for assessment", assessment);
    }
  };

  const SelfAssessmentLevel = {
    VIOLATED: "VIOLATED",
    NOT_APPLICABLE: "NOT_APPLICABLE",
    SATISFIED: "SATISFIED",
  };

  const handleAssessmentButtonPressed = (link, optionString) => {
    handleToggle(link, optionString);
  };
    
  function StatusIcon({ status }) {
    var statusIcon = <Help className={styles.levelIndicatorIcon} />;
    if (status != undefined) {
    switch (status.toUpperCase()) {
      case SelfAssessmentLevel.VIOLATED:
        statusIcon = (
          <StatusAlert
            className={`${styles.levelIndicatorIcon} ${styles.noAdoption}`}
          />
        );
        break;
      case SelfAssessmentLevel.NOT_APPLICABLE:
        statusIcon = (
          <Information
            className={`${styles.levelIndicatorIcon} ${styles.partialAdoption}`}
          />
        );
        break;
      case SelfAssessmentLevel.SATISFIED:
        statusIcon = (
          <StatusSuccess
            className={`${styles.levelIndicatorIcon} ${styles.completeAdoption}`}
          />
        );
        break;
      default:
        break;
    }
    }
  
    return (
      <div className={styles.levelIndicator}>{statusIcon}</div>
    );
  }
  
  function buttonText(statusOption) {
    switch (statusOption.toUpperCase()) {
      case SelfAssessmentLevel.SATISFIED:
        return "Yes";
      case SelfAssessmentLevel.VIOLATED:
        return "No";
      case SelfAssessmentLevel.NOT_APPLICABLE:
        return "N/A";
      default:
        return "Unknown";
    }
  }

  return (
    <>
      {showAssessmentsSection && (
        <PageSection headline="Capability Self Assessments">
          <Card>
            <CardContent>
              <p>
                Self Assessments are a way to simply indicate if a capability is
                following a specific guideline or not. This is a way to keep
                track of -- and monitor -- the adoption of guidelines in DFDS
                across all capabilities.
              </p>

              {(assessments || []).length > 0 ? (
                <>
                  <p>
                    The following self assessments are available for this
                    capability. You can toggle them on or off to indicate if the
                    capability is following the guideline or not.
                  </p>
                  {(assessments || []).map((assessment) => (
                    <div
                      className={styles.assessmentRow}
                      key={assessment.selfAssessmentType}
                    >
                      <StatusIcon status={assessment.status}/>
                      <div className={styles.assessmentDescriptionWrapper}>
                        {assessment.description}
                      </div>
                      {/* Insert one button for each status option */}
                      {/* Indicate pressed on the one matching current status */}
                      {(assessment.statusOptions || []).map((statusOption) => (
                        <Button
                        className={styles.assessmentButton}
                        onClick={() => handleAssessmentButtonPressed(assessment, statusOption)}
                        variation={(assessment.status && assessment.status.toUpperCase() === statusOption.toUpperCase())
                          ? "primary"
                          : "outlined"}
                      > {buttonText(statusOption)}
                      </Button>))}
                    </div>
                  ))}
                </>
              ) : (
                <p>
                  No Self Assessments are available in the system at the moment.
                  You do not have to do anything. Huzzah!
                </p>
              )}
            </CardContent>
          </Card>
        </PageSection>
      )}
    </>
  );
}
