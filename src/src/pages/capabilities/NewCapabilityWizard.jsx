import React, { useState, useEffect, useContext } from "react";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import styles from "./capabilities.module.css";
import CreationWizard from "../../CreationWizard";
import { TrackedLink } from "@/components/Tracking";
import {
  ENUM_COSTCENTER_OPTIONS,
  getBusinessCapabilitiesOptions,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS,
  ENUM_CAPABILITY_CONTAINS_AI_OPTIONS,
  ENUM_ENV_OPTIONS,
} from "@/constants/tagConstants";
import Select from "react-select";
import AppContext from "@/AppContext";
import { useTheme } from "@/context/ThemeContext";

function getSelectStyles(isDark) {
  return {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "0.75rem",
      fontFamily: "SFMono-Regular, SF Mono, Fira Code, Consolas, monospace",
      border: `1px solid ${isDark ? "#334155" : "#d9dcde"}`,
      boxShadow: "none",
      borderRadius: "5px",
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      "&:hover": { borderColor: isDark ? "#60a5fa" : "#0e7cc1" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
    menu: (base) => ({
      ...base,
      fontSize: "0.75rem",
      fontFamily: "SFMono-Regular, SF Mono, Fira Code, Consolas, monospace",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      border: isDark ? "1px solid #334155" : undefined,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#e2e8f0" : "#002b45",
      fontWeight: 500,
    }),
    placeholder: (base) => ({ ...base, color: isDark ? "#64748b" : "#afafaf" }),
    input: (base) => ({
      ...base,
      fontSize: "1rem",
      color: isDark ? "#e2e8f0" : "#002b45",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark
          ? "#1d4ed8"
          : "#0e7cc1"
        : state.isFocused
        ? isDark
          ? "#0f172a"
          : "#f2f2f2"
        : isDark
        ? "#1e293b"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : isDark ? "#e2e8f0" : "#002b45",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDark ? "#334155" : "#d9dcde",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDark ? "#64748b" : "#afafaf",
    }),
  };
}

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
      title: "Tags",
      content: (props) => <TagsStep {...props} />,
      optional: false,
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
    tags: {},
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
      rybbitDomain="capability"
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
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="capability-name">
            Name <span aria-hidden="true">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help underline decoration-dotted text-sm text-[#666666]">
                  Naming tip
                </span>
              </TooltipTrigger>
              <TooltipContent>
                It is recommended to use &quot;-&quot; (dashes) to separate
                words in a multi word Capability name (e.g. foo-bar instead of
                foo_bar).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="capability-name"
          placeholder="Enter name of capability"
          required
          value={formData.name}
          onChange={changeName}
          maxLength={255}
        />
        {nameError && <p className="text-xs text-red-600">{nameError}</p>}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <Label htmlFor="capability-description">
          Description <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="capability-description"
          placeholder="Enter a description"
          required
          value={formData.description}
          onChange={changeDescription}
        />
        {descriptionError && (
          <p className="text-xs text-red-600">{descriptionError}</p>
        )}
      </div>
    </>
  );
};

const COST_CENTRE_TAG = "dfds.cost.centre";
const BUSINESS_CAPABILITY_TAG = "dfds.businessCapability";

// Same set as TagComplianceEvaluator.RequiredTags in selfservice-api, which rejects
// a new capability that lacks any of them.
const TAG_FIELDS = [
  {
    key: COST_CENTRE_TAG,
    label: "Cost Center",
    description:
      "Internal analysis and cost aggregation tools such as FinOut requires this to be present.",
    options: () => ENUM_COSTCENTER_OPTIONS,
    error: "Capabilities must have a cost centre",
  },
  {
    key: BUSINESS_CAPABILITY_TAG,
    label: "Business Capability",
    description: "Select the Business Capability for this Cost Center.",
    options: (tags) => getBusinessCapabilitiesOptions(tags[COST_CENTRE_TAG]),
    error: "A Business Capability must be set",
  },
  {
    key: "dfds.env",
    label: "Environment",
    description: "Select the environment for this capability.",
    options: () => ENUM_ENV_OPTIONS,
    error: "An environment must be set",
  },
  {
    key: "dfds.data.classification",
    label: "Data Classification",
    guidance: {
      href: "https://wiki.dfds.cloud/en/playbooks/Security/Understanding-Data-Confidentiality",
      text: "Understand Classification",
    },
    options: () => ENUM_CLASSIFICATION_OPTIONS,
    error: "Data classification must be set",
  },
  {
    key: "dfds.service.criticality",
    label: "Service Criticality",
    guidance: {
      href: "https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Criticality",
      text: "Understand Criticality",
    },
    options: () => ENUM_CRITICALITY_OPTIONS,
    error: "Service criticality must be set",
  },
  {
    key: "dfds.service.availability",
    label: "Service Availability",
    guidance: {
      href: "https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Availability",
      text: "Understand Availability",
    },
    options: () => ENUM_AVAILABILITY_OPTIONS,
    error: "Service availability must be set",
  },
];

const RequiredMarker = () => (
  <span
    title="Required"
    aria-label="Required"
    className="text-[#be1e2d] dark:text-[#f87171] font-semibold"
  >
    {" *"}
  </span>
);

const TagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const { isDark } = useTheme();
  const tags = formValues.tags;
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setCanContinue(TAG_FIELDS.every((field) => !!tags[field.key]));
  }, [tags]);

  const setTag = (key, value) => {
    setFormValues((prev) => {
      const nextTags = { ...prev.tags, [key]: value };
      if (key === COST_CENTRE_TAG && prev.tags[COST_CENTRE_TAG] !== value) {
        const options = getBusinessCapabilitiesOptions(value);
        nextTags[BUSINESS_CAPABILITY_TAG] =
          options.length === 1 ? options[0].value : "";
      }
      return { ...prev, tags: nextTags };
    });
  };

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
          className="text-action underline underline-offset-2 hover:no-underline"
        >
          See DFDS Tagging Policy.
        </TrackedLink>
      </Text>

      <Text>
        <span className="text-[#be1e2d] dark:text-[#f87171] font-semibold">
          *
        </span>{" "}
        All tags are required.
      </Text>

      {TAG_FIELDS.map((field) => {
        const options = field.options(tags);
        const selected =
          options.find((opt) => opt.value === tags[field.key]) ?? null;
        const showError = touched[field.key] && !tags[field.key];
        return (
          <div key={field.key}>
            <label className={styles.label} htmlFor={field.key}>
              {field.label}:
              <RequiredMarker />
            </label>
            <span>
              {field.guidance ? (
                <>
                  Guidance:{" "}
                  <a
                    href={field.guidance.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {field.guidance.text}
                  </a>
                </>
              ) : (
                field.description
              )}
            </span>
            <Select
              inputId={field.key}
              options={options}
              value={selected}
              placeholder="Select..."
              className={styles.input}
              styles={getSelectStyles(isDark)}
              aria-invalid={showError}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, [field.key]: true }))
              }
              onChange={(selection) =>
                setTag(field.key, selection?.value || "")
              }
            />
            <div className={styles.errorContainer}>
              {showError && <span className={styles.error}>{field.error}</span>}
            </div>
          </div>
        );
      })}
    </>
  );
};

const AIServicesStep = ({ formValues, setFormValues, setCanContinue }) => {
  const { isDark } = useTheme();
  const [containsAI, setContainsAI] = useState(undefined);
  const [
    selectedCapabilityContainsAIOption,
    setSelectedCapabilityContainsAIOption,
  ] = useState(undefined);

  useEffect(() => {
    const containsAI = formValues?.tags["dfds.capability.contains-ai"];
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
          tags: {
            ...prev.tags,
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
          className="text-action underline underline-offset-2 hover:no-underline"
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
          className="text-action underline underline-offset-2 hover:no-underline"
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
          styles={getSelectStyles(isDark)}
          onChange={(selection) =>
            setSelectedCapabilityContainsAIOption(selection)
          }
        ></Select>
      </div>
    </>
  );
};

const SummaryStep = ({ formValues }) => {
  const { user } = useContext(AppContext);
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
      <h2>Tags</h2>
      <p>
        <strong>Owner:</strong> {user?.name || user?.username || "Not provided"}
      </p>
      <p>
        <strong>Cost Center:</strong>{" "}
        {formValues.tags["dfds.cost.centre"] || "Not provided"}
      </p>
      <p>
        <strong>Business Capability:</strong>{" "}
        {formValues.tags["dfds.businessCapability"] || "Not provided"}
      </p>
      <p>
        <strong>Environment:</strong>{" "}
        {formValues.tags["dfds.env"] || "Not provided"}
      </p>
      <p>
        <strong>Data Classification:</strong>{" "}
        {formValues.tags["dfds.data.classification"] || "Not provided"}
      </p>
      <p>
        <strong>Service Criticality:</strong>{" "}
        {formValues.tags["dfds.service.criticality"] || "Not provided"}
      </p>
      <p>
        <strong>Service Availability:</strong>{" "}
        {formValues.tags["dfds.service.availability"] || "Not provided"}
      </p>
      <p>
        <strong>Contains AI Services:</strong>{" "}
        {formValues.tags["dfds.capability.contains-ai"] || "Not provided"}
      </p>
    </>
  );
};
