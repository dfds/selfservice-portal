import React, { useEffect, useContext, useState } from "react";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/react-components";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import styles from "./capabilityTags.module.css";
import Select from "react-select";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";
import {
  ENUM_COSTCENTER_OPTIONS,
  getBusinessCapabilitiesOptions,
  ENUM_AVAILABILITY_OPTIONS,
  ENUM_CLASSIFICATION_OPTIONS,
  ENUM_CRITICALITY_OPTIONS,
  ENUM_AZURERG_USAGE_OPTIONS,
  ENUM_CAPABILITY_CONTAINS_AI_OPTIONS,
  ENUM_ENV_OPTIONS,
} from "@/constants/tagConstants";

function TagsForm({ canEditTags, onSubmit, defaultValues }) {
  const [formHasError, setFormHasError] = useState(false);
  const [costCenterError, setCostCenterError] = useState(undefined);
  const [businessCapabilityError, setBusinessCapabilityError] =
    useState(undefined);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCostCenterOption, setSelectedCostCenterOption] =
    useState(undefined);
  const [
    selectedBusinessCapabilityOption,
    setSelectedBusinessCapabilityOption,
  ] = useState(undefined);
  const [selectedCriticalityOption, setSelectedCriticalityOption] =
    useState(undefined);
  const [selectedAvailabilityOption, setSelectedAvailabilityOption] =
    useState(undefined);
  const [selectedClassificationOption, setSelectedClassificationOption] =
    useState(undefined);
  const [selectedAzureRGUsageOption, setSelectedAzureRGUsageOption] =
    useState(undefined);
  const [selectedEnvOption, setSelectedEnvOption] = useState(undefined);
  const [
    selectedCapabilityContainsAIOption,
    setSelectedCapabilityContainsAIOption,
  ] = useState(undefined);

  useEffect(() => {
    if (costCenterError) {
      setFormHasError(true);
    } else {
      setFormHasError(false);
    }
  }, [costCenterError]);

  useEffect(() => {
    if (!selectedCostCenterOption) {
      setCostCenterError("A cost center must be set");
    } else {
      setCostCenterError(undefined);
    }
  }, [selectedCostCenterOption]);

  useEffect(() => {
    console.log(
      "selectedBusinessCapabilityOption",
      selectedBusinessCapabilityOption,
    );
    if (!selectedBusinessCapabilityOption) {
      setBusinessCapabilityError("A Business Capability must be set");
    } else {
      setBusinessCapabilityError(undefined);
    }
  }, [selectedBusinessCapabilityOption]);

  useEffect(() => {
    if (defaultValues) {
      const prevCostCenter = defaultValues["dfds.cost.centre"];
      if (prevCostCenter) {
        const selectedOption = ENUM_COSTCENTER_OPTIONS.find(
          (opt) => opt.value === prevCostCenter,
        );
        setSelectedCostCenterOption(selectedOption || undefined);
      }

      const prevBusinessCapability = defaultValues["dfds.businessCapability"];
      if (prevBusinessCapability && prevCostCenter) {
        const options = getBusinessCapabilitiesOptions(prevCostCenter);
        const selectedOption = options.find(
          (opt) => opt.value === prevBusinessCapability,
        );
        setSelectedBusinessCapabilityOption(selectedOption || undefined);
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

      const prevEnv = defaultValues["dfds.env"];
      if (prevEnv) {
        const selectedOption = ENUM_ENV_OPTIONS.find(
          (opt) => opt.value === prevEnv,
        );
        setSelectedEnvOption(selectedOption || undefined);
      }

      const prevContainsAI = defaultValues["dfds.capability.contains-ai"];
      if (prevContainsAI) {
        const selectedOption = ENUM_CAPABILITY_CONTAINS_AI_OPTIONS.find(
          (opt) => opt.value === prevContainsAI,
        );
        setSelectedCapabilityContainsAIOption(selectedOption || undefined);
      }
    }
  }, [defaultValues]);

  const translateToTags = () => {
    const data = {
      "dfds.cost.centre": selectedCostCenterOption?.value,
      "dfds.businessCapability": selectedBusinessCapabilityOption?.value,
      "dfds.data.classification": selectedClassificationOption?.value,
      "dfds.service.criticality": selectedCriticalityOption?.value,
      "dfds.service.availability": selectedAvailabilityOption?.value,
      "dfds.azure.purpose": selectedAzureRGUsageOption?.value,
      "dfds.capability.contains-ai": selectedCapabilityContainsAIOption?.value,
      "dfds.env": selectedEnvOption?.value,
    };
    return data;
  };

  return (
    <>
      {canEditTags && formHasError && (
        <Text className={`${styles.error} ${styles.center}`}>
          Some tags are not compliant. Please correct them and resubmit.
        </Text>
      )}

      {/* Cost Center */}
      <div>
        <label className={styles.label}>Cost Center:</label>
        <span>
          Required for internal analysis and cost aggregation tools such as
          FinOut.
        </span>
        <Select
          options={ENUM_COSTCENTER_OPTIONS}
          value={selectedCostCenterOption}
          className={styles.input}
          isDisabled={!canEditTags}
          onChange={(e) => {
            setSelectedCostCenterOption(e);
            setSelectedBusinessCapabilityOption(null); // force dropdown to show placeholder
            setIsDirty(true);
            setBusinessCapabilityError("A Business Capability must be set");
          }}
        />
        <div className={styles.errorContainer}>
          {canEditTags && costCenterError && (
            <span className={styles.error}>{costCenterError}</span>
          )}
        </div>
      </div>

      {/* Business Capability */}
      <div>
        <label className={styles.label}>Business Capability:</label>
        <span>Select the Business Capability for this Cost Center.</span>
        <Select
          options={getBusinessCapabilitiesOptions(
            selectedCostCenterOption?.value,
          )}
          value={selectedBusinessCapabilityOption ?? null}
          className={styles.input}
          isDisabled={!canEditTags}
          placeholder="Select..."
          onChange={(e) => {
            setSelectedBusinessCapabilityOption(e);
            setIsDirty(true);
          }}
        />
        <div className={styles.errorContainer}>
          {canEditTags && businessCapabilityError && (
            <span className={styles.error}>{businessCapabilityError}</span>
          )}
        </div>
      </div>

      {/* Environment Tag */}
      <div>
        <label className={styles.label}>Environment:</label>
        <span>Select the environment for this capability.</span>
        <Select
          options={ENUM_ENV_OPTIONS}
          value={selectedEnvOption}
          className={styles.input}
          isDisabled={!canEditTags}
          onChange={(e) => {
            setSelectedEnvOption(e);
            setIsDirty(true);
          }}
        />
        <div className={styles.errorContainer}></div>
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
          isDisabled={!canEditTags}
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
          isDisabled={!canEditTags}
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
          isDisabled={!canEditTags}
          onChange={(e) => {
            setSelectedAvailabilityOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

      {/* Azure Resource Group use case */}
      <div>
        <label className={styles.label}>
          Azure Resource Group reason for use:
        </label>
        <span>
          Guidance: If using Azure Resource Groups, please provide a reason for
          using it. This is required for requesting Azure Resource Groups. See:{" "}
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
          isDisabled={!canEditTags}
          onChange={(e) => {
            setSelectedAzureRGUsageOption(e);
            setIsDirty(true);
          }}
        />

        <div className={styles.errorContainer}></div>
      </div>

      {/* Capability AI Usage Claim */}
      <div>
        <label className={styles.label}>
          Does this capability provide AI services
        </label>
        <span>
          Guidance: Please indicate whether this capability contains AI
          services. This information is important for compliance and monitoring
          purposes.
        </span>
        <Select
          options={ENUM_CAPABILITY_CONTAINS_AI_OPTIONS}
          value={selectedCapabilityContainsAIOption}
          className={styles.input}
          onChange={(e) => {
            setSelectedCapabilityContainsAIOption(e);
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
        disabled={!canEditTags || formHasError || !isDirty}
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

export function CapabilityTagsPageSection({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="Capability Tags">
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
