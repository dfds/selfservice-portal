import React, { useEffect, useContext, useState } from "react";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/react-components";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import styles from "./capabilityTags.module.css";
import Select from "react-select";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import DropDownUserSelection from "./DropDownUserSelection";
import { useQueryClient } from "@tanstack/react-query";
import {
  ENUM_COSTCENTER_OPTIONS,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS,
  ENUM_AZURERG_USAGE_OPTIONS,
} from "@/constants/tagConstants";

function TagsForm({ canEditTags, onSubmit, defaultValues }) {
  const [isUserSearchActive, setIsUserSearchActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { members } = useContext(SelectedCapabilityContext);

  const [formHasError, setFormHasError] = useState(false);
  const [ownerError, setOwnerError] = useState(undefined);
  const [costCenterError, setCostCenterError] = useState(undefined);

  const [isDirty, setIsDirty] = useState(false);

  const [owner, setOwner] = useState("");
  const [selectedCostCenterOption, setSelectedCostCenterOption] =
    useState(undefined);
  const [selectedCriticalityOption, setSelectedCriticalityOption] =
    useState(undefined);
  const [selectedAvailabilityOption, setSelectedAvailabilityOption] =
    useState(undefined);
  const [selectedClassificationOption, setSelectedClassificationOption] =
    useState(undefined);
  const [selectedAzureRGUsageOption, setSelectedAzureRGUsageOption] =
    useState(undefined);

  useEffect(() => {
    if (ownerError || costCenterError ) {
      setFormHasError(true);
    } else {
      setFormHasError(false);
    }
  }, [ownerError, costCenterError]);

  const emailValidator = (input) => {
    const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(input);
  };

  const filterMembers = (searchInput) => {
    // filter members based on the search input and presence in owners
    return members.filter((user) =>
      user.name.toLowerCase().includes(searchInput.toLowerCase()),
    );
  };

  const checkIsMember = (email) => {
    const matches = members.filter(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
    return matches.length > 0;
  };

  useEffect(() => {
    if (!selectedCostCenterOption) {
      setCostCenterError("A cost center must be set");
    } else {
      setCostCenterError(undefined);
    }
  }, [selectedCostCenterOption]);

  useEffect(() => {
    if (!owner || owner.length === "") {
      setIsUserSearchActive(false);
      setOwnerError("Capabilities must have an owner");
      return;
    } else {
      const filteredMembers = filterMembers(owner);
      setIsUserSearchActive(true);
      if (filteredMembers.length === 0) {
        setIsUserSearchActive(false);
      }
      setSuggestions(filteredMembers);
    }
    if (!emailValidator(owner)) {
      setOwnerError("Owner must be a valid email");
      return;
    }
    if (members && !checkIsMember(owner)) {
      setOwnerError("Owner must be a member of the capability");
      return;
    } else {
      setIsUserSearchActive(false);
    }
    setOwnerError(undefined);
  }, [owner, members]);

  useEffect(() => {
    if (defaultValues) {
      const prevOwner = defaultValues["dfds.owner"];
      if (prevOwner) {
        setOwner(prevOwner);
      }

      const prevCostCenter = defaultValues["dfds.cost.centre"];
      if (prevCostCenter) {
        const selectedOption = ENUM_COSTCENTER_OPTIONS.find(
          (opt) => opt.value === prevCostCenter,
        );
        setSelectedCostCenterOption(selectedOption || undefined);
      }

      const prevClassification = defaultValues["dfds.data.classification"];
      if (prevClassification) {
        const selectedOption = ENUM_CLASSIFICATION_OPTIONS.find(
          (opt) => opt.value === prevClassification,
        );
        setSelectedClassificationOption(selectedOption || undefined);
      }

      const prevCriticality = defaultValues["dfds.service.criticality"];
      if (prevCriticality) {
        const selectedOption = ENUM_CRITICALITY_OPTIONS.find(
          (opt) => opt.value === prevCriticality,
        );
        setSelectedCriticalityOption(selectedOption || undefined);
      }

      const prevAvailability = defaultValues["dfds.service.availability"];
      if (prevAvailability) {
        const selectedOption = ENUM_AVAILABILITY_OPTIONS.find(
          (opt) => opt.value === prevAvailability,
        );
        setSelectedAvailabilityOption(selectedOption || undefined);
      }

      const prevAzureRGUsage = defaultValues["dfds.azure.purpose"];
      if (prevAzureRGUsage) {
        const selectedOption = ENUM_AZURERG_USAGE_OPTIONS.find(
          (opt) => opt.value === prevAzureRGUsage,
        );
        setSelectedAzureRGUsageOption(selectedOption || undefined);
      }
    }
  }, [defaultValues]);

  const translateToTags = () => {
    const data = {
      "dfds.owner": owner,
      "dfds.cost.centre": selectedCostCenterOption?.value,
      "dfds.data.classification": selectedClassificationOption?.value,
      "dfds.service.criticality": selectedCriticalityOption?.value,
      "dfds.service.availability": selectedAvailabilityOption?.value,
      "dfds.azure.purpose": selectedAzureRGUsageOption?.value,
    };
    return data;
  };

  const ownerUpdated = (newOwner) => {
    setIsUserSearchActive(false);
    setOwner(newOwner);
    setIsDirty(true);
  };

  return (
    <>
      {formHasError && (
        <Text className={`${styles.error} ${styles.center}`}>
          Some tags are not compliant. Please correct them and resubmit.
        </Text>
      )}
      {/* Owner */}
      <div>
        <label className={styles.label}>Owner:</label>
        <span>Each capability must have a single responsible owner.</span>
        <input
          type="email"
          placeholder="Search through members"
          value={owner}
          onChange={(e) => setOwner(e.target?.value || "")}
          className={`${styles.input} ${styles.inputBorder}`}
        />

        {isUserSearchActive ? (
          <div className={styles.dropDownMenu}>
            <DropDownUserSelection
              items={suggestions}
              addUserFromDropDown={ownerUpdated}
            />
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className={styles.errorContainer}>
        {ownerError && <span className={styles.error}>{ownerError}</span>}
      </div>

      {/* Cost Center */}
      <div>
        <label className={styles.label}>Cost Center:</label>
        <span>
          Internal analysis and cost aggregation tools such as FinOut requires
          this to be present.
        </span>
        <Select
          options={ENUM_COSTCENTER_OPTIONS}
          value={selectedCostCenterOption}
          className={styles.input}
          onChange={(e) => {
            setSelectedCostCenterOption(e);
            setIsDirty(true);
          }}
        />
        <div className={styles.errorContainer}>
          {costCenterError && (
            <span className={styles.error}>{costCenterError}</span>
          )}
        </div>
      </div>

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
          onChange={(e) => {
            setSelectedClassificationOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

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
          onChange={(e) => {
            setSelectedCriticalityOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

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
          onChange={(e) => {
            setSelectedAvailabilityOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

      {/* Azure Resource Group use case */}
      <div>
        <label className={styles.label}>Azure Resource Group reason for use:</label>
        <span>
          Guidance: If using Azure Resource Groups, please provide a reason for
          using it. This is required for requesting Azure Resource Groups.
          See:{" "}
          <a
            href="https://wiki.dfds.cloud/en/architecture/Architectural-Decision-Records-ADRS/which-cloud"
            target="_blank"
            rel="noreferrer"
          >
            cloud selection guidance
          </a>
        </span>
        <Select
          options={ENUM_AZURERG_USAGE_OPTIONS}
          value={selectedAzureRGUsageOption}
          className={styles.input}
          onChange={(e) => {
            setSelectedAzureRGUsageOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

      {/* Submit Button */}
      <TrackedButton
        trackName="CapabilityTags-Submit"
        size="small"
        variation="outlined"
        disabled={!canEditTags || formHasError || !isDirty }
        onClick={() => {
          onSubmit(translateToTags());
          setIsDirty(false);
        }}
      >
        Submit
      </TrackedButton>
    </>
  );
}

export function CapabilityTagsPageSection() {
  return (
    <PageSection headline="Capability Tags">
      <CapabilityTags />
    </PageSection>
  );
}

export function CapabilityTags() {
  const { metadata, links, details } = useContext(SelectedCapabilityContext);
  const updateCapabilityMetadata = useUpdateCapabilityMetadata();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const queryClient = useQueryClient();

  const [canEditTags, setCanEditTags] = useState(false);

  const [existingTags, setExistingTags] = useState({});

  useEffect(() => {
    if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
      setCanEditTags(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata) {
      setExistingTags(JSON.parse(metadata));
    }
  }, [metadata]);

  const handleSubmit = (data) => {
    updateCapabilityMetadata.mutate(
      {
        capabilityDefinition: details,
        payload: {
          jsonMetadata: data,
        },
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "metadata", details?.id],
          });
        },
      },
    );
  };

  return (
    <>
      <Text>
        Tagging your capability correctly helps all of us with oversight and
        incident management.
      </Text>
      <Text>
        However, tagging capabilities is only the first step; Please remember to
        tag your cloud resources as well.
        <TrackedLink
          trackName="TaggingPolicy"
          href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
          target="_blank"
          rel="noreferrer"
        >
          <Text>see DFDS Tagging Policy.</Text>
        </TrackedLink>
      </Text>

      <TagsForm
        defaultValues={existingTags}
        canEditTags={canEditTags}
        onSubmit={(data) => handleSubmit(data)}
      />
    </>
  );
}
