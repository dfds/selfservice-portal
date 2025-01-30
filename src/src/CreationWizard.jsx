import React, { useEffect, useState } from "react";
import { Button } from "@/components/dfds-ui/react-components";
import styles from "pages/capabilities/capabilities.module.css";
import { Wizard, useWizard } from "react-use-wizard";
import { Modal } from "@/components/dfds-ui/modal";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import Circle from "@mui/icons-material/Circle";

export default function CreationWizard({
  isOpen,
  onClose,
  onComplete,
  steps,
  title,
  jsonSchemaString,
  emptyFormValues,
  completeInProgress,
  completeName,
  sizes = {
    s: "75%",
    m: "75%",
    l: "75%",
    xl: "75%",
    xxl: "75%",
  },
}) {
  const [canContinue, setCanContinue] = useState(true);
  const [formValues, setFormValues] = useState(emptyFormValues);

  return (
    <Modal
      heading={title}
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      showClose={true}
      fixedTopPosition={true}
      onRequestClose={onClose}
      sizes={sizes}
    >
      <Wizard
        startIndex={0}
        header={<Header steps={steps} />}
        footer={
          <Footer
            onComplete={onComplete}
            steps={steps}
            canContinue={canContinue}
            formValues={formValues}
            completeInProgress={completeInProgress}
            completeName={completeName}
          />
        }
      >
        {steps.map((step) => (
          <div key={step.title}>
            {step.content({
              formValues,
              setFormValues,
              setCanContinue,
              jsonSchemaString,
            })}
          </div>
        ))}
      </Wizard>
    </Modal>
  );
}

function SelfServiceStepIcon(props) {
  const { completed, active } = props;

  if (completed) {
    return <Check className={styles.stepiconcompleted} />;
  }

  if (active) {
    return <Circle className={styles.stepiconactive} />;
  }

  return <Circle className={styles.stepiconunresolved} />;
}

const Header = ({ steps }) => {
  const { activeStep } = useWizard();

  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((step, index) => {
        const stepProps = {
          completed: step.completed && !step.skipped,
          active: activeStep === index,
        };
        return (
          <Step key={step.title} {...stepProps}>
            <StepLabel StepIconComponent={SelfServiceStepIcon}>
              {step.title}{" "}
              {step.optional && (
                <>
                  <br />
                  <span>(optional)</span>
                </>
              )}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

const Footer = ({
  onComplete,
  steps,
  canContinue,
  formValues,
  completeInProgress,
  completeName,
}) => {
  const { previousStep, nextStep, activeStep, stepCount } = useWizard();

  return (
    <div>
      {activeStep > 0 && (
        <Button
          className={styles.backButton}
          onClick={() => {
            steps[activeStep - 1].skipped = false;
            steps[activeStep - 1].completed = false;
            if (activeStep + 1 === stepCount) {
              // last step; activeStep is 0-based
              steps[activeStep].completed = false;
            }
            previousStep();
          }}
          variation="secondary"
          size="small"
        >
          Back
        </Button>
      )}
      {activeStep + 1 < stepCount && (
        <Button
          className={styles.nextButton}
          disabled={!canContinue}
          onClick={() => {
            steps[activeStep].skipped = false;
            steps[activeStep].completed = true;
            if (activeStep + 2 === stepCount) {
              // next step is last step; activeStep is 0-based
              steps[activeStep + 1].completed = true;
            }
            nextStep();
          }}
          variation="primary"
          size="small"
        >
          Next
        </Button>
      )}
      {/*
      {activeStep + 1 < stepCount && steps[activeStep].optional && (
        <Button
          className={styles.skipButton}
          onClick={() => {
            steps[activeStep].skipped = true;
            steps[activeStep].completed = true;
            if (activeStep + 2 === stepCount) {
              // next step is last step; activeStep is 0-based
              steps[activeStep + 1].completed = true;
            }
            nextStep();
          }}
          variation="outlined"
          size="small"
        >
          Skip
        </Button>
      )}
      */}
      {activeStep + 1 === stepCount && (
        <Button
          disabled={completeInProgress}
          className={styles.nextButton}
          onClick={() => {
            onComplete(formValues);
          }}
          variation="primary"
          size="small"
        >
          {completeName}
        </Button>
      )}
    </div>
  );
};
