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
import { useIsMobile } from "@/hooks/useIsMobile";

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
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto">
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

function SnakeStepper({ steps, activeStep, stepsPerRow = 3 }) {
  const rows = [];
  for (let i = 0; i < steps.length; i += stepsPerRow) {
    const chunk = steps
      .slice(i, i + stepsPerRow)
      .map((step, j) => ({ ...step, globalIndex: i + j }));
    while (chunk.length < stepsPerRow) chunk.push(null);
    rows.push(chunk);
  }

  return (
    <div className="w-full px-2 pb-2">
      {rows.map((rowItems, rowIndex) => {
        const isOdd = rowIndex % 2 === 1;
        const isLastRow = rowIndex === rows.length - 1;

        return (
          <div key={rowIndex}>
            <div
              className={`flex items-start ${isOdd ? "flex-row-reverse" : ""}`}
            >
              {rowItems.map((item, colIndex) => {
                const prevItem = rowItems[colIndex - 1];
                const connectorCompleted =
                  item !== null &&
                  prevItem != null &&
                  prevItem.completed &&
                  !prevItem.skipped &&
                  item.completed &&
                  !item.skipped;

                return (
                  <React.Fragment
                    key={item ? item.globalIndex : `ph-${colIndex}`}
                  >
                    {colIndex > 0 && (
                      <div
                        className={`flex-1 h-0.5 mt-[10px] ${
                          connectorCompleted
                            ? "bg-[#4caf50]"
                            : "bg-[#afafaf] dark:bg-[#334155]"
                        }`}
                      />
                    )}
                    {item === null ? (
                      <div className="w-[56px] flex-shrink-0" />
                    ) : (
                      <div className="flex flex-col items-center flex-shrink-0 w-[56px]">
                        <SelfServiceStepIcon
                          completed={item.completed && !item.skipped}
                          active={activeStep === item.globalIndex}
                        />
                        <span className="text-[10px] text-center mt-1 leading-tight text-muted">
                          {item.title}
                        </span>
                        {item.optional && (
                          <span className="text-[9px] text-muted text-center block">
                            (optional)
                          </span>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {!isLastRow && (
              <div
                className={`flex ${isOdd ? "justify-start" : "justify-end"}`}
                style={{
                  paddingLeft: isOdd ? "27px" : undefined,
                  paddingRight: isOdd ? undefined : "27px",
                }}
              >
                <div className="w-0.5 h-5 bg-[#afafaf] dark:bg-[#334155]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const Header = ({ steps }) => {
  const { activeStep } = useWizard();
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  const muiTheme = useMemo(
    () => createTheme({ palette: { mode: isDark ? "dark" : "light" } }),
    [isDark],
  );

  if (isMobile) {
    return <SnakeStepper steps={steps} activeStep={activeStep} />;
  }

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
              <StepLabel
                StepIconComponent={SelfServiceStepIcon}
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize: "10px",
                    fontFamily: "inherit",
                    lineHeight: 1.3,
                  },
                }}
              >
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
