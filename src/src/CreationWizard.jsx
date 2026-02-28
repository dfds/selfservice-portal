import React, { useState, useMemo } from "react";
import styles from "pages/capabilities/capabilities.module.css";
import { Wizard, useWizard } from "react-use-wizard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import Circle from "@mui/icons-material/Circle";
import { TrackedButton } from "@/components/Tracking";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@/context/ThemeContext";

export default function CreationWizard({
  isOpen,
  onClose,
  onComplete,
  steps,
  title,
  emptyFormValues,
  completeInProgress,
  completeName,
}) {
  const [canContinue, setCanContinue] = useState(true);
  const [formValues, setFormValues] = useState(emptyFormValues);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
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
            <div key={step.title} className={styles.wizardStep}>
              {step.content({
                formValues,
                setFormValues,
                setCanContinue,
              })}
            </div>
          ))}
        </Wizard>
      </DialogContent>
    </Dialog>
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
  const { isDark } = useTheme();
  const muiTheme = useMemo(
    () => createTheme({ palette: { mode: isDark ? "dark" : "light" } }),
    [isDark],
  );

  return (
    <ThemeProvider theme={muiTheme}>
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
                    <span>(optional step)</span>
                  </>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </ThemeProvider>
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
        <TrackedButton
          trackName="CapabilityWizard-Back"
          className={styles.backButton}
          onClick={() => {
            steps[activeStep - 1].skipped = false;
            steps[activeStep - 1].completed = false;
            if (activeStep + 1 === stepCount) {
              steps[activeStep].completed = false;
            }
            previousStep();
          }}
          variation="secondary"
          size="small"
        >
          Back
        </TrackedButton>
      )}
      {activeStep + 1 < stepCount && (
        <TrackedButton
          trackName="CapabilityWizard-Next"
          className={styles.nextButton}
          disabled={!canContinue}
          onClick={() => {
            steps[activeStep].skipped = false;
            steps[activeStep].completed = true;
            if (activeStep + 2 === stepCount) {
              steps[activeStep + 1].completed = true;
            }
            nextStep();
          }}
          variation="primary"
          size="small"
        >
          Next
        </TrackedButton>
      )}
      {activeStep + 1 === stepCount && (
        <TrackedButton
          trackName="CapabilityWizard-Complete"
          disabled={completeInProgress}
          className={styles.nextButton}
          onClick={() => {
            onComplete(formValues);
          }}
          variation="primary"
          size="small"
        >
          {completeName}
        </TrackedButton>
      )}
    </div>
  );
};
