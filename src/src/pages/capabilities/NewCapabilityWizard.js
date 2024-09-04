import React, { useState, useContext, createRef, useEffect } from "react";
import { Button } from "@dfds-ui/react-components";
import { Tooltip, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { Wizard, useWizard } from "react-use-wizard";
import CreationWizard from "../../CreationWizard";
import { JsonSchemaProvider } from "../../JsonSchemaContext";
import { CapabilityTagsSubForm } from "./capabilityTags/capabilityTagsSubForm";

export default function NewCapabilityWizard({
  inProgress,
  onAddCapabilityClicked,
  onCloseClicked,
}) {
  const [invitees, setInvitees] = useState([]);

  const steps = [
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
  ];

  const handleAddCapabilityClicked = async (formData) => {
    console.log(formData);
    const jsonMetadataString = JSON.stringify(formData.mandatoryTags, null, 1);
    onAddCapabilityClicked({
      ...formData,
      invitations: invitees,
      jsonMetadataString,
    });
  };
  const emptyFormValues = {
    name: "",
    description: "",
    mandatoryTags: "",
    formRef: createRef(),
  };

  return (
    <CreationWizard
      isOpen={true}
      onClose={onCloseClicked}
      onComplete={handleAddCapabilityClicked}
      steps={steps}
      title="New Capability Wizard"
      emptyFormValues={emptyFormValues}
    />
  );
}

const BasicInformationStep = ({
  formValues,
  setFormValues,
  setCanContinue,
}) => {
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
      setNameError(
        'Allowed characters are a-z, 0-9, "-", and "_" and it must not start or end with "_" or "-". Do not use more than one of "-" or "_" in a row.',
      );
      return false;
    }
    if (name.length > 150) {
      setNameError("Please consider a shorter name.");
      return false;
    }

    setNameError("");
    return true;
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newDescription = e?.target?.value || "";
    setFormData((prev) => ({ ...prev, ...{ description: newDescription } }));
    validateDescription(newDescription);
  };

  const validateDescription = (description) => {
    if (description.length === 0) {
      //setDescriptionError("Please write a description");
      return false;
    }
    setDescriptionError("");
    return true;
  };

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
        <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'></Tooltip>
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
  );
};

const MandatoryTagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [formData, setFormData] = useState(formValues);
  const [formValid, setFormValid] = useState(false);
  const [validMetadata, setValidMetadata] = useState(false);
  const formRef = createRef();
  const [metadataFormData, setMetadataFormData] = useState({});

  useEffect(() => {
    if (formValid) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [formValid]);

  const validateMandatoryTags = async () => {
    formRef.current.validateForm();
    formRef.current.validateForm();

    return true;
  };

  const changeTags = (e) => {
    e.preventDefault();
    let newTags = e?.target?.value || "";
    setFormData((prev) => ({
      ...prev,
      ...{ mandatoryTags: newTags.toLowerCase() },
    }));
    validateMandatoryTags(newTags);
  };

  useEffect(() => {
    let tagsValid = validateMandatoryTags(metadataFormData);
    setFormValid(tagsValid);
    setFormValues((prev) => {
      return { ...prev, mandatoryTags: metadataFormData };
    });
  }, [metadataFormData]);

  return (
    <>
      <div className={styles.tooltip}>
        <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'></Tooltip>
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

      <JsonSchemaProvider>
        <CapabilityTagsSubForm
          label="Capability Tags"
          setMetadata={setMetadataFormData}
          setHasSchema={() => {}}
          setValidMetadata={setValidMetadata}
          preexistingFormData={{}}
          formRef={formRef}
        />
      </JsonSchemaProvider>
    </>
  );
};

const WizardStep = ({ steps }) => {
  const { activeStep, stepCount } = useWizard();

  return (
    <>
      <h1>
        Step {activeStep + 1} of {stepCount}
      </h1>
    </>
  );
};
