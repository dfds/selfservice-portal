import React, { useState, useContext, createRef, useEffect } from "react";
import { Tooltip, Text, TextField } from "@/components/dfds-ui/react-components";
import styles from "./capabilities.module.css";
import { useWizard } from "react-use-wizard";
import CreationWizard from "../../CreationWizard";
import JsonSchemaContext, { JsonSchemaProvider } from "../../JsonSchemaContext";
import { CapabilityTagsSubForm } from "./metadataTabbedView/capabilityTags/capabilityTagsSubForm";
import { Invitations } from "./invitations";

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
      title: "Other Tags",
      content: (props) => <OptionalTagsStep {...props} />,
      optional: true,
      skipped: false,
    },
    {
      title: "Invite Members",
      content: (props) => <InviteMemberStep {...props} />,
      optional: true,
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
    invitations: [],
  };

  return (
    <JsonSchemaProvider>
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
    </JsonSchemaProvider>
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
  const [formValid, setFormValid] = useState(false);
  const formRef = createRef();
  const [metadataFormData, setMetadataFormData] = useState(
    formValues.mandatoryTags,
  );
  const { mandatoryJsonSchema, hasJsonSchemaProperties } =
    useContext(JsonSchemaContext);

  useEffect(() => {
    if (formValid) {
      setFormValues((prev) => {
        return { ...prev, mandatoryTags: metadataFormData };
      });
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [formValid, metadataFormData]);

  return (
    <>
      <a
        href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
        target="_blank"
        rel="noreferrer"
      >
        <Text>See Tagging Policy</Text>
      </a>
      {hasJsonSchemaProperties ? (
        <CapabilityTagsSubForm
          label="Capability Tags"
          setMetadata={setMetadataFormData}
          setHasSchema={() => {}}
          setValidMetadata={setFormValid}
          preexistingFormData={formValues.mandatoryTags}
          formRef={formRef}
          jsonSchema={mandatoryJsonSchema}
        />
      ) : (
        <Text>There are no mandatory tags to set</Text>
      )}
    </>
  );
};

const OptionalTagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [formValid, setFormValid] = useState(false);
  const formRef = createRef();
  const [metadataFormData, setMetadataFormData] = useState(
    formValues.optionalTags,
  );
  const { optionalJsonSchema, hasJsonSchemaProperties } =
    useContext(JsonSchemaContext);

  useEffect(() => {
    if (formValid) {
      setFormValues((prev) => {
        return { ...prev, optionalTags: metadataFormData };
      });
      setCanContinue(true);
    } else {
      setCanContinue(false);
    }
  }, [formValid, metadataFormData]); // formValid will not change value between modifying optional tags

  return (
    <>
      <a
        href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
        target="_blank"
        rel="noreferrer"
      >
        <Text>See Tagging Policy</Text>
      </a>
      {hasJsonSchemaProperties ? (
        <CapabilityTagsSubForm
          label="Capability Tags"
          setMetadata={setMetadataFormData}
          setHasSchema={() => {}}
          setValidMetadata={setFormValid}
          preexistingFormData={formValues.optionalTags}
          formRef={formRef}
          jsonSchema={optionalJsonSchema}
        />
      ) : (
        <Text>There are no optional tags to set</Text>
      )}
    </>
  );
};

const InviteMemberStep = ({ formValues, setFormValues }) => {
  const [formData, setFormData] = useState({});
  const [invitees, setInvitees] = useState(formValues.invitations || []);

  useEffect(() => {
    setFormValues((prev) => {
      return { ...prev, invitations: invitees };
    });
  }, [invitees]);

  return (
    <>
      <h1>Invite Members</h1>
      <Invitations
        invitees={invitees}
        setInvitees={setInvitees}
        formData={formData}
        setFormData={setFormData}
      />
    </>
  );
};

const SummaryStep = ({ formValues }) => {
  return (
    <>
      <h1>Summary</h1>
      <pre>{JSON.stringify(formValues, null, 2)}</pre>
    </>
  );
};
