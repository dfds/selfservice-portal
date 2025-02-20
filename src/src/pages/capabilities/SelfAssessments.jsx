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
import {
  Card,
  CardTitle,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Spinner,
} from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import SplashImage from "./splash.jpg";
import styles from "./selfassessments.module.css";

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

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

  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

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
              Self assessments allows capability owners to evaluate the current
              state of a capability. Self assessments can be disabled but never
              deleted, thus preserving historical data and meaning.
            </p>
            <CardActions>
              <TrackedButton
                trackName="SelfAssessmentWizard-Begin"
                size="small"
                onClick={() => setShowNewSelfAssessmentWizard(true)}
              >
                Add
              </TrackedButton>
            </CardActions>
          </CardContent>
        </Card>

        <PageSection headline="Self Assessments">
          {!isFetched && <Spinner />}
          {isFetched && selfAssessments.length === 0 && (
            <p>No self assessments found</p>
          )}
          {isFetched &&
            (selfAssessments || []).map((selfAssessment) => (
              <Card key={selfAssessment.id}>
                <CardContent>
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
