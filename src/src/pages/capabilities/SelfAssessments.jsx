import React, { useEffect, useState, useContext } from "react";
import Page from "components/Page";
import AppContext from "AppContext";
import {
  useSelfAssessments,
  useSelfAssessmentAdd,
  useSelfAssessmentActivate,
  useSelfAssessmentDeactivate,
} from "@/state/remote/queries/selfassessments";
import NewSelfAssessmentWizard from "./NewSelfAssessmentWizard";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import PageSection from "components/PageSection";
import SplashImage from "./splash.jpg";
import styles from "./selfassessments.module.css";
import { TrackedButton } from "@/components/Tracking";
import { sleep } from "../../Utils";

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
    <div
      className={`${styles.switch} ${isOn ? styles.on : "off"}`}
      onClick={handleToggle}
    >
      <div className={styles.slider}></div>
    </div>
  );
};

const SelfAssessmentRow = ({
  id,
  shortName,
  description,
  state,
  deactivateFunction,
  activateFunction,
}) => {
  return (
    <div>
      <div className={styles.inlinecenter}>
        <span className={styles.inlinecenter}>{description}</span>
        <ToggleSwitch
          initialState={state}
          switchedOn={() => {
            activateFunction(id);
          }}
          switchedOff={() => {
            deactivateFunction(id);
          }}
        />
      </div>
      <br />
      <span className={styles.dimmed}>[name: {shortName}]</span>
    </div>
  );
};

export default function CapabilitiesSelfAssessmentsPage() {
  const { reloadSelfAssessments } = useContext(AppContext);
  const { isFetched, data } = useSelfAssessments();
  const selfAssessmentAdd = useSelfAssessmentAdd();
  const selfAssessmentDeactivate = useSelfAssessmentDeactivate();
  const selfAssessmentActivate = useSelfAssessmentActivate();

  const [selfAssessments, setSelfAssessments] = useState([]);
  const [showNewSelfAssessmentWizard, setShowNewSelfAssessmentWizard] =
    useState(false);
  const [isCreatingNewSelfAssessment, setIsCreatingNewSelfAssessment] =
    useState(false);

  async function addNewSelfAssessment(
    shortName,
    description,
    documentationUrl,
  ) {
    selfAssessmentAdd.mutate({
      payload: {
        shortName: shortName,
        description: description,
        documentationUrl: documentationUrl,
      },
    });
    await sleep(1000);
    reloadSelfAssessments("addNewSelfAssessment");
  }

  useEffect(() => {
    if (isFetched && data) {
      setSelfAssessments(data);
    }
  }, [isFetched, data]);

  const handleAddSelfAssessment = async (formData) => {
    setIsCreatingNewSelfAssessment(true);
    await addNewSelfAssessment(
      formData.shortName,
      formData.description,
      formData.documentationUrl,
    );
    setShowNewSelfAssessmentWizard(false);
    setIsCreatingNewSelfAssessment(false);
    reloadSelfAssessments("handleAddSelfAssessment");
    setShowNewSelfAssessmentWizard(false);
  };

  return (
    <>
      <Page title="Capability Self Assessments">
        {showNewSelfAssessmentWizard && (
          <NewSelfAssessmentWizard
            inProgress={isCreatingNewSelfAssessment}
            onAddSelfAssessmentClicked={handleAddSelfAssessment}
            onCloseClicked={() => setShowNewSelfAssessmentWizard(false)}
          />
        )}

        <Card className="bg-white dark:bg-[#1e293b] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <img
              src={SplashImage}
              className={`${styles.cardMediaImage} md:w-1/3 object-cover`}
              alt=""
            />
            <div className="flex-1">
              <CardTitle className="text-xl font-bold p-6 pb-2">Information</CardTitle>
              <CardContent>
                <p>
                  Self assessments allows capability owners to evaluate the current
                  state of a capability. Self assessments can be disabled but never
                  deleted, thus preserving historical data and meaning.
                </p>
                <div className="flex gap-2 flex-wrap items-center mt-4">
                  <TrackedButton
                    trackName="SelfAssessmentWizard-Begin"
                    size="sm"
                    onClick={() => setShowNewSelfAssessmentWizard(true)}
                  >
                    Add
                  </TrackedButton>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        <PageSection headline="Self Assessments">
          {!isFetched && <Spinner />}
          {isFetched && selfAssessments.length === 0 && (
            <p>No self assessments found</p>
          )}
          {isFetched &&
            (selfAssessments || []).map((selfAssessment) => (
              <Card key={selfAssessment.id} className="mb-2">
                <CardContent className="pt-4">
                  <SelfAssessmentRow
                    id={selfAssessment.id}
                    shortName={selfAssessment.shortName}
                    description={selfAssessment.description}
                    state={selfAssessment.isActive}
                    activateFunction={(id) => {
                      selfAssessmentActivate.mutate({
                        id: id,
                      }),
                        reloadSelfAssessments("Activate");
                    }}
                    deactivateFunction={(id) => {
                      selfAssessmentDeactivate.mutate({
                        id: id,
                      }),
                        reloadSelfAssessments("Deactivate");
                    }}
                  />
                </CardContent>
              </Card>
            ))}
        </PageSection>
      </Page>
    </>
  );
}
