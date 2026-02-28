import React, { useState, useEffect } from "react";
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

export default function NewSelfAssessmentWizard({
  inProgress,
  onAddSelfAssessmentClicked,
  onCloseClicked,
}) {
  const steps = [
    {
      title: "Self Assessment Information",
      content: (props) => <BasicInformationStep {...props} />,
      optional: false,
      skipped: false,
    },
    {
      title: "Documentation",
      content: (props) => <DocumentationStep {...props} />,
      optional: true,
      skipped: false,
    },
  ];

  const handleAddSelfAssessmentClicked = async (formData) => {
    onAddSelfAssessmentClicked({
      ...formData,
    });
  };

  const emptyFormValues = {
    shortName: "",
    description: "",
    documentationUrl: "",
  };

  return (
    <CreationWizard
      isOpen={true}
      onClose={onCloseClicked}
      onComplete={handleAddSelfAssessmentClicked}
      steps={steps}
      title="New Self Assessment Wizard"
      emptyFormValues={emptyFormValues}
      completeInProgress={inProgress}
      completeName={"Add Self Assessment"}
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
    setFormData((prev) => ({
      ...prev,
      ...{ shortName: newName.toLowerCase() },
    }));
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
    if (description.length == 0) {
      setDescriptionError(
        "Please write a description; This is all other users will see.",
      );
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
    let nameValid = validateName(formData.shortName);
    let descriptionValid = validateDescription(formData.description);
    setFormValid(nameValid && descriptionValid);
    setFormValues(formData);
  }, [formData]);

  return (
    <>
      <div className={styles.tooltip}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted text-sm text-[#666666]">
                Naming tip
              </span>
            </TooltipTrigger>
            <TooltipContent>
              It is recommended to use &quot;-&quot; (dashes) to separate words in a multi word name (e.g. foo-bar instead of foo_bar).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="selfassessment-name">Name <span aria-hidden="true">*</span></Label>
        <Input
          id="selfassessment-name"
          placeholder="Enter name of capability"
          required
          value={formData.shortName}
          onChange={changeName}
          maxLength={255}
        />
        {nameError && <p className="text-xs text-red-600">{nameError}</p>}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <Label htmlFor="selfassessment-description">Description <span aria-hidden="true">*</span></Label>
        <Input
          id="selfassessment-description"
          placeholder="Enter a description"
          required
          value={formData.description}
          onChange={changeDescription}
        />
        {descriptionError && <p className="text-xs text-red-600">{descriptionError}</p>}
      </div>
    </>
  );
};

const DocumentationStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [formData, setFormData] = useState(formValues);
  const [formValid, setFormValid] = useState(true);

  const changeDocumentationURL = (e) => {
    e.preventDefault();
    const newDocumentationUrl = e?.target?.value || "";
    setFormData((prev) => ({
      ...prev,
      ...{ documentationURL: newDocumentationUrl },
    }));
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
    setFormValues(formData);
  }, [formData]);

  return (
    <>
      <Text>
        Note: Currently this information is not used in the frontend. In the
        future, we will link capability users to whichever documentation you see
        fit for this assessment. Consider adding this information already now.
      </Text>
      <div className="flex flex-col gap-1 mt-2">
        <Label htmlFor="documentation-url">Documentation URL <span aria-hidden="true">*</span></Label>
        <Input
          id="documentation-url"
          placeholder="Enter a URL for documentation"
          required
          value={formData.documentationUrl}
          onChange={changeDocumentationURL}
        />
      </div>
    </>
  );
};
