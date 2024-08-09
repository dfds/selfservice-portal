import React, { useState, useContext, createRef, useEffect } from "react";
import { Button } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { Wizard, useWizard } from 'react-use-wizard';
import { Modal } from "@dfds-ui/modal";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import Circle from '@mui/icons-material/Circle';

export default function NewCapabilityWizard({
  inProgress,
  onAddCapabilityClicked,
  onCloseClicked,
}) {
    const emptyFormValues = {
        name: "",
        description: "",
        mandatoryTags: "",
    };

    const [canContinue, setCanContinue] = useState(true);
    const [formValues, setFormValues] = useState(emptyFormValues)

    let steps = [
    {
        title: "Basic Information",
        content: (props) => <BasicInformationStep {...props} />,
        optional: false,
        skipped: false,
    },
    {
        title: "Tags",
        content: (props) => <MandatoryTagsStep {...props} />,
        optional: false,
        skipped: false,
    },
    {
        title: "Additional Tags",
        content: (props) => <WizardStep {...props} />,
        optional: true,
        skipped: false,
    },
    {
        title: "AWS and Azure",
        content: (props) => <WizardStep {...props} />,
        optional: true,
        skipped: false,
    },
    {
        title: "Invitations",
        content: (props) => <WizardStep {...props} />,
        optional: true,
        skipped: false,
    },
    {
        title: "Summary",
        content: (props) => <WizardStep {...props} />,
    },
    ].slice();

  return (
    <Modal
        heading={"New Capability Wizard"}
        isOpen={true}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={true}
        showClose={true}
        fixedTopPosition={true}
        onRequestClose={() => onCloseClicked()}
        sizes={{
            s: "75%",
            m: "75%",
            l: "75%",
            xl: "75%",
            xxl: "75%",
        }}
    >
        <Wizard
            startIndex={0}
            header={<Header steps={steps} />}
            footer={<Footer onAddCapabilityClicked={onAddCapabilityClicked} steps={steps} canContinue={canContinue} />}
        >
            {steps.map((step) => (
                <div key={step.title}>
                    {step.content({formValues, setFormValues, setCanContinue})}
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
  

const Header = ({steps}) => {
    const { activeStep } = useWizard();
  
    return (
        <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => {
            const stepProps = {
                completed: step.completed && !step.skipped,
                active: activeStep === index,
            };
            return <Step key={step.title} { ...stepProps}>
                <StepLabel StepIconComponent={SelfServiceStepIcon}>{step.title} {step.optional && (<><br /><span>(optional)</span></>)}</StepLabel>
            </Step>
            })}
</Stepper>
    );

}

const Footer = ({onAddCapabilityClicked, steps, canContinue}) => {
    const { previousStep, nextStep, activeStep, stepCount } = useWizard();

    return (
        <div>
            {(activeStep > 0) && <Button
                className={styles.backButton}
                onClick={() => {
                    steps[activeStep-1].skipped=false;
                    steps[activeStep-1].completed=false;
                    if (activeStep + 1 === stepCount) { // last step; activeStep is 0-based
                        steps[activeStep].completed=false;
                    };
                    previousStep()
                }}
                variation="secondary"
                size="small"
            >
                Back
            </Button>}
            {(activeStep + 1 < stepCount) && <Button
                className={styles.nextButton}
                disabled={!canContinue}
                onClick={() => {
                    steps[activeStep].skipped=false;
                    steps[activeStep].completed=true;
                    if (activeStep + 2 === stepCount) { // next step is last step; activeStep is 0-based
                        steps[activeStep+1].completed=true;
                    };
                    nextStep()
                }}
                variation="primary"
                size="small"
            >
                Next
            </Button>}
            {(activeStep + 1 < stepCount) && steps[activeStep].optional && <Button
                className={styles.skipButton}
                onClick={() => {
                    steps[activeStep].skipped=true;
                    steps[activeStep].completed=true;  
                    if (activeStep + 2 === stepCount) { // next step is last step; activeStep is 0-based
                        steps[activeStep+1].completed=true;
                    };  
                    nextStep()
                }}
                variation="outlined"
                size="small"
            >
                Skip
            </Button>}
            {(activeStep + 1 === stepCount) && <Button
                className={styles.nextButton}
                onClick={() => {
                    onAddCapabilityClicked()
                }}
                variation="primary"
                size="small"
            >
                Add Capability
            </Button>}
        </div>
    );
}

const WizardStep = ({steps}) => {
    const { handleStep, activeStep , stepCount} = useWizard();

    handleStep(() => {
        //console.log('Going to step ' + activeStep + 2);
    })
    

    return (
      <>
        <h1>Step {activeStep + 1} of {stepCount}</h1>
      </>
    );
};

const BasicInformationStep = ({formValues, setFormValues, setCanContinue}) => {
    const [formData, setFormData] = useState(formValues);
    const [formValid, setFormValid] = useState(false);
    const [descriptionError, setDescriptionError] = useState("");
    const [nameError, setNameError] = useState("");
   
    const changeName = (e) => {
        e.preventDefault();
        let newName = e?.target?.value || "";
        newName = newName.replace(/\s+/g, "-");
        setFormData((prev) => ({ ...prev, ...{ name: newName.toLowerCase() } }));
        validateName(newName);
    };

    const validateName = (name) => {
        const isNameValid =
        name !== "" &&
        !name.match(/^\s*$/g) &&
        !name.match(/(_|-)$/g) &&
        !name.match(/^(_|-)/g) &&
        !name.match(/[-_.]{2,}/g) &&
        !name.match(/[^a-zA-Z0-9\-_]/g);

        if (name.length === 0) {
            setNameError("");
            return false;
        }

        if (!isNameValid) {
            setNameError('Allowed characters are a-z, 0-9, "-", and "_" and it must not start or end with "_" or "-". Do not use more than one of "-" or "_" in a row.');
            return false;
        }
        if (name.length > 150) {
            setNameError("Please consider a shorter name.");
            return false;
        }

        setNameError("");
        return true;
    }

    const changeDescription = (e) => {
        e.preventDefault();
        const newDescription = e?.target?.value || "";
        setFormData((prev) => ({ ...prev, ...{ description: newDescription } }));
        validateDescription(newDescription)
    };

    const validateDescription = (description) => {
        if (description.length === 0) {
            //setDescriptionError("Please write a description");
            return false;
        }
        setDescriptionError("");
        return true;
    }

    useEffect(() => {
        if (formValid) {
            setCanContinue(true);
        } else {
            setCanContinue(false);
        }
    }, [formValid]);

    useEffect(() => {
        let nameValid = validateName(formData.name);
        let descriptionValid = validateDescription(formData.description);
        setFormValid(nameValid && descriptionValid);
        setFormValues(formData);
    }, [formData]);

    return (
        <>
            <div className={styles.tooltip}>
              <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'>
              </Tooltip>
            </div>
            <TextField
              label="Name"
              placeholder="Enter name of capability"
              required
              value={formData.name}
              onChange={changeName}
              errorMessage={nameError}
              maxLength={255}
            />
            <TextField
                label="Description"
                placeholder="Enter a description"
                required
                value={formData.description}
                onChange={changeDescription}
                errorMessage={descriptionError}
            ></TextField>
        </>
    )
}

const MandatoryTagsStep = ({formValues, setFormValues, setCanContinue}) => {
    const [formData, setFormData] = useState(formValues);
    const [formValid, setFormValid] = useState(false);

    useEffect(() => {
        if (formValid) {
            setCanContinue(true);
        } else {
            setCanContinue(false);
        }
    }, [formValid]);

    const validateMandatoryTags = (tags) => {
        if (tags.length === 0) {
            return false;
        }
        return true;
    };

    const changeTags = (e) => {
        e.preventDefault();
        let newTags = e?.target?.value || "";
        setFormData((prev) => ({ ...prev, ...{ mandatoryTags: newTags.toLowerCase() } }));
        validateMandatoryTags(newTags);
    };

    useEffect(() => {
        let tagsValid = validateMandatoryTags(formData.mandatoryTags);
        setFormValid(tagsValid);
        setFormValues(formData);
    }, [formData]);

    return (
        <>
            <div className={styles.tooltip}>
              <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'>
              </Tooltip>
            </div>
            <TextField
              label="Tags"
              placeholder="Commaseparated list of tags"
              required
              value={formData.mandatoryTags}
              onChange={changeTags}
              //errorMessage={tagsError}
              maxLength={255}
            />
        </>
    )
}
