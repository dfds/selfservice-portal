import React, { useState, useContext, createRef, useEffect } from "react";
import { Tooltip, Text, TextField } from "@dfds-ui/react-components";
import styles from "./capabilities.module.css";
import CreationWizard from "../../CreationWizard";
import JsonSchemaContext, { JsonSchemaProvider } from "../../JsonSchemaContext";
import { CapabilityTagsSubForm } from "./metadataTabbedView/capabilityTags/capabilityTagsSubForm";
import { Invitations } from "./invitations";
import { TrackedLink } from "@/components/Tracking";
import {
  ENUM_COSTCENTER_OPTIONS,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS
} from "@/constants/tagConstants"
import { useForm, Controller } from "react-hook-form";
import AppContext from "@/AppContext";
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
  const [costCentre, setCostCentre] = useState("")
  const { user } = useContext(AppContext);

    const {
        clearErrors,
        setError,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

  useEffect(() => {
    clearErrors();
    if (costCentre && costCentre.length > 0) {
      setFormValues((prev) => {
        return { ...prev, mandatoryTags: {
          "dfds.owner": user.email,
          "dfds.cost.centre": costCentre
        } };
      });
      setCanContinue(true);
    } else {
      setError("costCenterInput", {
        type: "manual",
        message: "Capabilities must have a cost centre"
      })
      setCanContinue(false);
    }
  }, [costCentre]);

  return (
    <>
      <TrackedLink
        trackName="Wiki-TaggingPolicy"
        href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
        target="_blank"
        rel="noreferrer"
      >
        <Text>See Tagging Policy</Text>
      </TrackedLink>

      { errors != undefined && Object.keys(errors).length > 0 && (
        <Text className={`${styles.error} ${styles.center}`}>
          Some tags are not compliant. Please correct them and resubmit.
        </Text>
      )}
      <form onSubmit={() => {}}>
        
      {/* Owner */}
      <div>
        <label className={styles.label}>Owner:</label>
        <span>As the creator you will be the responsible owner for this capability. You can change this after creation.</span>
        <input
          type="email"
          value={user.email}
          disabled={true}
          className={`${styles.input} ${styles.inputBorder}`}
        />
      </div>

        <div className={styles.errorContainer}>
          {errors.ownerInput && <span className={styles.error}>{errors.ownerInput.message}</span>}
        </div>
        
        {/* Cost Center */}
        <div>
            <label className={styles.label}>Cost Center:</label>
            <span>Internal analysis and cost aggregation tools such as FinOut requires this to be present.</span>
            <Select options={ENUM_COSTCENTER_OPTIONS} className={styles.input} onChange={(selection) => setCostCentre(selection.value)}></Select>
            <div className={styles.errorContainer}>
                {errors.costCenterInput && <span className={styles.error}>{errors.costCenterInput.message}</span>}
            </div>
      </div>
      </form>
    </>
  );
};

const OptionalTagsStep = ({ formValues, setFormValues, setCanContinue }) => {
  const [sunsetDate, setSunsetDate] = useState(undefined)
  const [sunsetError, setSunsetError] = useState(undefined)
  const [classification, setClassification] = useState(undefined)
  const [criticality, setCriticality] = useState(undefined)
  const [availability, setAvailability] = useState(undefined)

  useEffect(() => {
    if (sunsetError) {
      setCanContinue(false);
    } else {
      setCanContinue(true);
    }
  }, [sunsetError])
  
  const isInFuture = (dateString) => {
    const inputDate = new Date(dateString);
    return inputDate > new Date();
  }

  useEffect(() => {
    //check if sunset date is set and if so is in the future:
    if (sunsetDate === undefined || isInFuture(sunsetDate)) {
      setSunsetError(undefined)
      setFormValues((prev) => {
        return { ...prev, optionalTags: {
          ...prev.optionalTags,
          "dfds.sunset_date": sunsetDate
        } };
      });
    } else {
      setSunsetError("If sunset date is set then it must be in the future");
    }
  }, [sunsetDate])
  

  useEffect(() => {
    setFormValues((prev) => {
      return { ...prev, optionalTags: {
        ...prev.optionalTags,
        "dfds.service.availability": availability
      } };
    });
    
  }, [availability])

  useEffect(() => {
    setFormValues((prev) => {
      return { ...prev, optionalTags: {
        ...prev.optionalTags,
        "dfds.service.criticality": criticality
      } };
    });
  }, [criticality])
  
  useEffect(() => {
    setFormValues((prev) => {
      return { ...prev, optionalTags: {
        ...prev.optionalTags,
        "dfds.data.classification": classification
      } };
    });
  }, [classification])


  return (
    <>
      <TrackedLink
        trackName="Wiki-TaggingPolicy"
        href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
        target="_blank"
        rel="noreferrer"
      >
        <Text>See Tagging Policy</Text>
      </TrackedLink>
      
              {/* Sunset Data */}
              <div>
                  <label className={styles.label}>Sunset Date:</label>
                  <span>The date when the capability is planned to not be relevant anymore. This is required for requesting Azure Resource Groups.</span>
                  <input
                      type="date"
                      className={`${styles.input} ${styles.inputBorder}`}
                      onChange={(e) => setSunsetDate(e.target.value)}
                  />
                  <div className={styles.errorContainer}>
                      {sunsetError && <span className={styles.error}>{sunsetError}</span>}
                  </div>
              </div>
        {/* Data Classification */}
        <div>
            <label className={styles.label}>Data Classification:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-Data-Confidentiality" target="_blank" rel="noreferrer">Understand Classification</a></span>
            <Select options={ENUM_CLASSIFICATION_OPTIONS} className={styles.input} onChange={(selection) => setClassification(selection.value)}></Select>
        </div>
        {/* Service Criticality */}
        <div>
            <label className={styles.label}>Service Criticality:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Criticality" target="_blank" rel="noreferrer">Understand Criticality</a></span>
            <Select options={ENUM_CRITICALITY_OPTIONS} className={styles.input} onChange={(selection) => setCriticality(selection.value)}></Select>
        </div>
        {/* Service Availability */}
        <div>
            <label className={styles.label}>Service Availability:</label>
            <span>Guidance: <a href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Availability" target="_blank" rel="noreferrer">Understand Availability</a></span>
            <Select options={ENUM_AVAILABILITY_OPTIONS} className={styles.input} onChange={(selection) => setAvailability(selection.value)}></Select>
        </div>
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
