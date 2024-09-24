import React, { useContext, useEffect } from "react";
import PageSection from "components/PageSection";
import styles from "./selfAssessment.module.css";
import { Card, CardContent } from "@dfds-ui/react-components";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { useState } from "react";
import { useSelfServiceRequest } from "../../../hooks/SelfServiceApi";
import { delay } from "Utils";

const ToggleSwitch = ({ initialState, switchedOff, switchedOn }) => {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    if (isOn) {
      switchedOff();
    } else {
      switchedOn();
    }
    setIsOn(!isOn);
  };

  return (
    <div className={`${styles.switch} ${isOn ? styles.on : 'off'}`} onClick={handleToggle}>
      <div className={styles.slider}></div>
    </div>
  );
};

export default function SelfAssessments() {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const { inProgress: assessmentInProgress, sendRequest: modifyAssessment } =
    useSelfServiceRequest();
  const [assessments, setAssessments] = useState([]);
  const [reloadAssessments, setReloadAssessments] = useState(true);
  const [showAssessmentsSection, setShowAssessmentsSection] = useState(false);
  const { links, setReloadConfigurationLevelInformation } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    if (assessmentInProgress === false) {
      setReloadAssessments(true);
    }
  }, [assessmentInProgress]);

  useEffect(() => {
    if (responseData?.selfAssessments && responseData?.selfAssessments.length >= 0) {
      setAssessments(responseData?.selfAssessments || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (links?.selfAssessments && (links?.selfAssessments.allow || []).includes("GET")) {
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

  const handleToggle = (link, method) => {
    if (link?.href) {
      modifyAssessment({
        urlSegments: [link.href],
        method: method,
      });
      // The following is a hack to reload configuration level information
      // a while after the assessment has been toggled.
      // This allows multiple toggles to be done in quick succession
      // without bothering with cancelling requests
      setTimeout(() => {
        setReloadConfigurationLevelInformation(true);
      }, 2000);
    }
  };
  
  const handleToggleOn = (link) => {
    handleToggle(link, "POST");
  };

  const handleToggleOff = (link) => {
    handleToggle(link, "DELETE");
  };

  return (
    <>
      {showAssessmentsSection && (
        <PageSection headline="Capability Self Assessments">
          <Card>
            <CardContent>
              <p>
                Self Assessments are a way to simply indicate if a capability is
                following a specific guideline or not. This is a way to keep track of
                -- and monitor -- the adoption of guidelines in DFDS across all capabilities.
              </p>

              <p>
                The following self assessments are available for this capability. You can
                toggle them on or off to indicate if the capability is following the guideline
                or not.
              </p>

              {(assessments || []).map((assessment) => (
                <div className={styles.assessmentRow} key={assessment.selfAssessmentType}>
                  <ToggleSwitch
                    initialState={assessment._links.addSelfAssessment === null}
                    switchedOn={() => handleToggleOn(assessment._links.addSelfAssessment)}
                    switchedOff={() => handleToggleOff(assessment._links.removeSelfAssessment)}
                  />
                  <div className={styles.assessmentDescriptionWrapper}>{assessment.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </PageSection>
      )}
    </>
  );
}
