import React, { useState, useEffect } from "react";
import { Tooltip, Text, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import CreationWizard from "../../CreationWizard";
import { TrackedLink } from "@/components/Tracking";
import {
  ENUM_COSTCENTER_OPTIONS,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS,
  ENUM_CAPABILITY_CONTAINS_AI_OPTIONS,
} from "@/constants/tagConstants";
import Select from "react-select";

export default function NewCapabilityWizard({
  inProgress,
  onAddCapabilityClicked,
  onCloseClicked,
}) {
  const steps = [
    {
      title: "Basic Information",
      content: (props) => <BasicInformationStep {...props} />,
      optional: false,
      skipped: false,
    },
    {
      title: "Mandatory Tags",
      content: (props) => <MandatoryTagsStep {...props} />,
      optional: false,
      skipped: false,
    },
    {
      title: "Recommended Tags",
      content: (props) => <OptionalTagsStep {...props} />,
      optional: true,
      skipped: false,
    },
    {
      title: "AI Services",
      content: (props) => <AIServicesStep {...props} />,
      optional: false,
      skipped: false,
    },
    {
      title: "Summary",
      content: (props) => <SummaryStep {...props} />,
      optional: false,
      skipped: false,
    },
  ];

  const handleAddCapabilityClicked = async (formData) => {
    onAddCapabilityClicked({
      ...formData,
    });
  };

  const emptyFormValues = {
    name: "",
    description: "",
    mandatoryTags: {},
    optionalTags: {},
  };

  return (
    <CreationWizard
      isOpen={true}
      onClose={onCloseClicked}
      onComplete={handleAddCapabilityClicked}
      steps={steps}
      title="New Capability Wizard"
      emptyFormValues={emptyFormValues}
      completeInProgress={inProgress}
      completeName={"Add Capability"}
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

  const validateDescription = (description) => {
    if (description.length === 0) {
      setDescriptionError("");
      return false;
    }
    if (description.length > 255) {
      setDescriptionError("Description must be less than 255 characters");
      return false;
    }

    setDescriptionError("");
    return true;
  };

  const changeDescription = (e) => {
    e.preventDefault();
    const newDescription = e?.target?.value || "";
    setFormData((prev) => ({ ...prev, ...{ description: newDescription } }));
    validateDescription(newDescription);
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
  const [costCentre, setCostCentre] = useState("");
  const [selectedCostCentreOption, setSelectedCostCentreOption] =
    useState(undefined);
  const [costCentreError, setCostCentreError] = useState(undefined);

  useEffect(() => {
    const costCentre = formValues?.mandatoryTags["dfds.cost.centre"];
    if (costCentre) {
      const selectedOption = ENUM_COSTCENTER_OPTIONS.find(
        (opt) => opt.value === costCentre,
      );
      setSelectedCostCentreOption(selectedOption || undefined);
    }
  }, [formValues]);

  useEffect(() => {
    if (selectedCostCentreOption) {
      setCostCentre(selectedCostCentreOption.value);
    }
  }, [selectedCostCentreOption]);

  useEffect(() => {
    setCostCentreError(undefined);
    if (costCentre && costCentre.length > 0) {
      setFormValues((prev) => {
        return {
          ...prev,
          mandatoryTags: {
            "dfds.cost.centre": costCentre,
          },
        };
      });
      setCanContinue(true);
    } else {
      setCostCentreError("Capabilities must have a cost centre");
      setCanContinue(false);
    }
  }, [costCentre]);

  return (
    <>
      <Text>
        If you are unsure about what tags are, please refer to the{" "}
        <TrackedLink
          trackName="TaggingPolicy"
          href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
          target="_blank"
          rel="noreferrer"
        >
          DFDS Tagging Policy.
        </TrackedLink>
      </Text>

      {costCentreError && (
        <Text className={`${styles.error} ${styles.center}`}>
          Some tags are not compliant. Please correct them and resubmit.
        </Text>
      )}

      {/* Cost Center */}
      <div>
        <label className={styles.label}>Cost Center:</label>
        <span>
          Internal analysis and cost aggregation tools such as FinOut requires
          this to be present.
        </span>
        <Select
          options={ENUM_COSTCENTER_OPTIONS}
          className={styles.input}
          value={selectedCostCentreOption}
          onChange={(selection) => setSelectedCostCentreOption(selection)}
        ></Select>
        <div className={styles.errorContainer}>
          {costCentreError && (
            <span className={styles.error}>{costCentreError}</span>
          )}
        </div>
      </div>
    </>
  );
};

const OptionalTagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [classification, setClassification] = useState(undefined);
  const [selectedClassificationOption, setSelectedClassificationOption] =
    useState(undefined);
  const [criticality, setCriticality] = useState(undefined);
  const [selectedCriticalityOption, setSelectedCriticalityOption] =
    useState(undefined);
  const [availability, setAvailability] = useState(undefined);
  const [selectedAvailabilityOption, setSelectedAvailabilityOption] =
    useState(undefined);

  useEffect(() => {
    if (selectedAvailabilityOption) {
      setAvailability(selectedAvailabilityOption.value);
    }
  }, [selectedAvailabilityOption]);

  useEffect(() => {
    if (selectedCriticalityOption) {
      setCriticality(selectedCriticalityOption.value);
    }
  }, [selectedCriticalityOption]);

  useEffect(() => {
    if (selectedClassificationOption) {
      setClassification(selectedClassificationOption.value);
    }
  }, [selectedClassificationOption]);

  useEffect(() => {
    const classification = formValues?.optionalTags["dfds.data.classification"];
    if (classification) {
      const selectedOption = ENUM_CLASSIFICATION_OPTIONS.find(
        (opt) => opt.value === classification,
      );
      setSelectedClassificationOption(selectedOption || undefined);
    }

    const criticality = formValues?.optionalTags["dfds.service.criticality"];
    if (criticality) {
      const selectedOption = ENUM_CRITICALITY_OPTIONS.find(
        (opt) => opt.value === criticality,
      );
      setSelectedCriticalityOption(selectedOption || undefined);
    }

    const availability = formValues?.optionalTags["dfds.service.availability"];
    if (availability) {
      const selectedOption = ENUM_AVAILABILITY_OPTIONS.find(
        (opt) => opt.value === availability,
      );
      setSelectedAvailabilityOption(selectedOption || undefined);
    }
  }, [formValues]);

  const isInFuture = (dateString) => {
    const inputDate = new Date(dateString);
    return inputDate > new Date();
  };

  useEffect(() => {
    setFormValues((prev) => {
      return {
        ...prev,
        optionalTags: {
          ...prev.optionalTags,
          "dfds.service.availability": availability,
        },
      };
    });
  }, [availability]);

  useEffect(() => {
    setFormValues((prev) => {
      return {
        ...prev,
        optionalTags: {
          ...prev.optionalTags,
          "dfds.service.criticality": criticality,
        },
      };
    });
  }, [criticality]);

  useEffect(() => {
    setFormValues((prev) => {
      return {
        ...prev,
        optionalTags: {
          ...prev.optionalTags,
          "dfds.data.classification": classification,
        },
      };
    });
  }, [classification]);

  return (
    <>
      <Text>
        Tagging your capability correctly helps all of us with oversight and
        incident management.
      </Text>

      <Text>
        However, tagging capabilities is only the first step;{" "}
        <span className={styles.bold}>
          Please remember to tag your cloud resources
        </span>{" "}
        as well.
      </Text>

      <Text>
        <TrackedLink
          trackName="TaggingPolicy"
          href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
          target="_blank"
          rel="noreferrer"
        >
          See DFDS Tagging Policy.
        </TrackedLink>
      </Text>

      {/* Data Classification */}
      <div>
        <label className={styles.label}>Data Classification:</label>
        <span>
          Guidance:{" "}
          <a
            href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-Data-Confidentiality"
            target="_blank"
            rel="noreferrer"
          >
            Understand Classification
          </a>
        </span>
        <Select
          options={ENUM_CLASSIFICATION_OPTIONS}
          value={selectedClassificationOption}
          className={styles.input}
          onChange={(selection) => setSelectedClassificationOption(selection)}
        ></Select>
      </div>
      <div className={styles.errorContainer}></div>
      {/* Service Criticality */}
      <div>
        <label className={styles.label}>Service Criticality:</label>
        <span>
          Guidance:{" "}
          <a
            href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Criticality"
            target="_blank"
            rel="noreferrer"
          >
            Understand Criticality
          </a>
        </span>
        <Select
          options={ENUM_CRITICALITY_OPTIONS}
          value={selectedCriticalityOption}
          className={styles.input}
          onChange={(selection) => setSelectedCriticalityOption(selection)}
        ></Select>
      </div>
      <div className={styles.errorContainer}></div>
      {/* Service Availability */}
      <div>
        <label className={styles.label}>Service Availability:</label>
        <span>
          Guidance:{" "}
          <a
            href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Availability"
            target="_blank"
            rel="noreferrer"
          >
            Understand Availability
          </a>
        </span>
        <Select
          options={ENUM_AVAILABILITY_OPTIONS}
          value={selectedAvailabilityOption}
          className={styles.input}
          onChange={(selection) => setSelectedAvailabilityOption(selection)}
        ></Select>
      </div>
      <div className={styles.errorContainer}></div>
    </>
  );
};

const AIServicesStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [containsAI, setContainsAI] = useState(undefined);
  const [
    selectedCapabilityContainsAIOption,
    setSelectedCapabilityContainsAIOption,
  ] = useState(undefined);

  useEffect(() => {
    const containsAI = formValues?.optionalTags["dfds.capability.contains-ai"];
    if (containsAI) {
      const selectedOption = ENUM_CAPABILITY_CONTAINS_AI_OPTIONS.find(
        (opt) => opt.value === containsAI,
      );
      setSelectedCapabilityContainsAIOption(selectedOption || undefined);
    }
  }, [formValues]);

  useEffect(() => {
    if (selectedCapabilityContainsAIOption) {
      setContainsAI(selectedCapabilityContainsAIOption.value);
    }
  }, [selectedCapabilityContainsAIOption]);

  useEffect(() => {
    if (containsAI !== undefined) {
      setFormValues((prev) => {
        return {
          ...prev,
          optionalTags: {
            ...prev.optionalTags,
            "dfds.capability.contains-ai": containsAI,
          },
        };
      });
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [containsAI]);

  return (
    <>
      <Text>Please indicate whether this capability contains AI projects.</Text>

      <Text>
        DFDS maintains an AI Catalogue to keep track of all available AI
        services. Indicating whether your capability provides AI services helps
        us ensure proper governance and oversight.
      </Text>

      <Text>
        The AI Catalogue can be found here{" "}
        <TrackedLink
          trackName="AICatalogue"
          href={"https://internal.hellman.oxygen.dfds.cloud/aicatalogue/"}
          target="_blank"
          rel="noreferrer"
        >
          AI Catalogue.
        </TrackedLink>
      </Text>

      <Text>
        Capabilities containing AI projects will be asked to provide additional
        information for the AI Catalogue after creation.
      </Text>

      <Text>
        For more information about DFDS's approach to AI, please refer to the{" "}
        <TrackedLink
          trackName="WikiAIGuidelines"
          href={
            "https://wiki.dfds.cloud/en/playbooks/ai-deployment-azure/AI-development-guiding-practices-handbookk"
          }
          target="_blank"
          rel="noreferrer"
        >
          AI guiding practices.
        </TrackedLink>
      </Text>

      <div>
        <label className={styles.label}>
          Does this capability contain AI services?
        </label>
        <Select
          options={ENUM_CAPABILITY_CONTAINS_AI_OPTIONS}
          value={selectedCapabilityContainsAIOption}
          className={styles.input}
          onChange={(selection) =>
            setSelectedCapabilityContainsAIOption(selection)
          }
        ></Select>
      </div>
    </>
  );
};

const SummaryStep = ({ formValues }) => {
  return (
    <>
      <h1>Summary</h1>
      <Text>
        Please review the information below before submitting your new
        capability.
      </Text>
      <h2>Basic Information</h2>
      <p>
        <strong>Name:</strong> {formValues.name || "Not provided"}
      </p>
      <p>
        <strong>Description:</strong> {formValues.description || "Not provided"}
      </p>
      <h2>Mandatory Tags</h2>
      <p>
        <strong>Owner:</strong>{" "}
        {formValues.mandatoryTags["dfds.owner"] || "Not provided"}
      </p>
      <p>
        <strong>Cost Center:</strong>{" "}
        {formValues.mandatoryTags["dfds.cost.centre"] || "Not provided"}
      </p>
      <h2>Optional Tags</h2>
      <p>
        <strong>Sunset Date:</strong>{" "}
        {formValues.optionalTags["dfds.planned_sunset"] || "Not provided"}
      </p>
      <p>
        <strong>Data Classification:</strong>{" "}
        {formValues.optionalTags["dfds.data.classification"] || "Not provided"}
      </p>
      <p>
        <strong>Service Criticality:</strong>{" "}
        {formValues.optionalTags["dfds.service.criticality"] || "Not provided"}
      </p>
      <p>
        <strong>Service Availability:</strong>{" "}
        {formValues.optionalTags["dfds.service.availability"] || "Not provided"}
      </p>
      <p>
        <strong>Contains AI Services:</strong>{" "}
        {formValues.optionalTags["dfds.capability.contains-ai"] ||
          "Not provided"}
      </p>
    </>
  );
};
