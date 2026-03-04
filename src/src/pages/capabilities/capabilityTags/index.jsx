import React, { useEffect, useContext, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import PageSection from "components/PageSection";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import Select from "react-select";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";
import { Banner } from "@/components/ui/banner";
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

function getSelectStyles(isDark) {
  return {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "30px",
      fontSize: "12px",
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
      fontSize: "12px",
      fontFamily: "SFMono-Regular, SF Mono, Fira Code, Consolas, monospace",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      border: isDark ? "1px solid #334155" : undefined,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    singleValue: (base) => ({ ...base, color: isDark ? "#e2e8f0" : "#002b45", fontWeight: 500 }),
    placeholder: (base) => ({ ...base, color: isDark ? "#64748b" : "#afafaf" }),
    input: (base) => ({ ...base, fontSize: "16px", color: isDark ? "#e2e8f0" : "#002b45" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDark ? "#1d4ed8" : "#0e7cc1")
        : state.isFocused
          ? (isDark ? "#0f172a" : "#f2f2f2")
          : (isDark ? "#1e293b" : "#ffffff"),
      color: state.isSelected ? "#ffffff" : (isDark ? "#e2e8f0" : "#002b45"),
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

const selectPortalProps = {
  menuPortalTarget: document.body,
  menuPosition: "fixed",
};

function TagField({ label, description, error, children }) {
  return (
    <div className="flex flex-col @[626px]:flex-row @[626px]:items-start py-3 border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0 gap-2 @[626px]:gap-4">
      <div className="@[626px]:w-[220px] @[626px]:flex-shrink-0">
        <div className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em]">
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-[#afafaf] dark:text-slate-500 leading-[1.4] mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="flex-1 @[626px]:flex @[626px]:justify-end">
        <div className="w-full @[626px]:w-[390px]">
          {children}
          {error && (
            <div className="font-mono text-[10px] text-[#be1e2d] mt-1">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TagsForm({ canEditTags, onSubmit, defaultValues, isPending = false }) {
  const { isDark } = useTheme();
  const selectStyles = getSelectStyles(isDark);
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

  // Auto-select the only business capability option if there is just one
  useEffect(() => {
    if (selectedCostCenterOption) {
      const options = getBusinessCapabilitiesOptions(
        selectedCostCenterOption.value,
      );
      if (
        options.length === 1 &&
        (!selectedBusinessCapabilityOption ||
          selectedBusinessCapabilityOption.value !== options[0].value)
      ) {
        setSelectedBusinessCapabilityOption(options[0]);
      }
    }
  }, [selectedCostCenterOption, selectedBusinessCapabilityOption]);

  useEffect(() => {
    if (!selectedCostCenterOption) {
      setCostCenterError("A cost center must be set");
    } else {
      setCostCenterError(undefined);
    }
  }, [selectedCostCenterOption]);

  useEffect(() => {
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
        <div className="mb-3 font-mono text-[10px] text-[#be1e2d] tracking-[0.04em]">
          Some tags are not compliant. Please correct them and resubmit.
        </div>
      )}

      <div className="tag-list @container">
        <TagField
          label="dfds.cost.centre"
          description="Required for internal analysis and cost aggregation tools such as FinOut."
          error={canEditTags ? costCenterError : undefined}
        >
          <Select
            {...selectPortalProps}
            options={ENUM_COSTCENTER_OPTIONS}
            value={selectedCostCenterOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCostCenterOption(e);
              setSelectedBusinessCapabilityOption(null);
              setIsDirty(true);
              setBusinessCapabilityError("A Business Capability must be set");
            }}
          />
        </TagField>

        <TagField
          label="dfds.businessCapability"
          description="Select the Business Capability for this Cost Center."
          error={canEditTags ? businessCapabilityError : undefined}
        >
          <Select
            {...selectPortalProps}
            options={getBusinessCapabilitiesOptions(
              selectedCostCenterOption?.value,
            )}
            value={selectedBusinessCapabilityOption ?? null}
            isDisabled={!canEditTags}
            placeholder="Select..."
            styles={selectStyles}
            onChange={(e) => {
              setSelectedBusinessCapabilityOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.env"
          description="Select the environment for this capability."
        >
          <Select
            {...selectPortalProps}
            options={ENUM_ENV_OPTIONS}
            value={selectedEnvOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedEnvOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.data.classification"
          description={
            <>
              Guidance:{" "}
              <a
                href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-Data-Confidentiality"
                target="_blank"
                rel="noreferrer"
                className="text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
              >
                Understand Classification
              </a>
            </>
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_CLASSIFICATION_OPTIONS}
            value={selectedClassificationOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedClassificationOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.service.criticality"
          description={
            <>
              Guidance:{" "}
              <a
                href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Criticality"
                target="_blank"
                rel="noreferrer"
                className="text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
              >
                Understand Criticality
              </a>
            </>
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_CRITICALITY_OPTIONS}
            value={selectedCriticalityOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCriticalityOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.service.availability"
          description={
            <>
              Guidance:{" "}
              <a
                href="https://wiki.dfds.cloud/en/playbooks/Security/Understanding-System-Availability"
                target="_blank"
                rel="noreferrer"
                className="text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
              >
                Understand Availability
              </a>
            </>
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_AVAILABILITY_OPTIONS}
            value={selectedAvailabilityOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedAvailabilityOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.azure.purpose"
          description={
            <>
              If using Azure Resource Groups, please provide a reason for using
              it. See:{" "}
              <a
                href="https://dfds.sharepoint.com/sites/GroupIT_Architecture/Lists/TEST%20%20Architecture%20Decision%20Record/DispForm.aspx?ID=5&e=M0gIY9"
                target="_blank"
                rel="noreferrer"
                className="text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
              >
                cloud selection guidance
              </a>
            </>
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_AZURERG_USAGE_OPTIONS}
            value={selectedAzureRGUsageOption}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedAzureRGUsageOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>

        <TagField
          label="dfds.capability.contains-ai"
          description="Please indicate whether this capability contains AI services. Required for compliance and monitoring."
        >
          <Select
            {...selectPortalProps}
            options={ENUM_CAPABILITY_CONTAINS_AI_OPTIONS}
            value={selectedCapabilityContainsAIOption}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCapabilityContainsAIOption(e);
              setIsDirty(true);
            }}
          />
        </TagField>
      </div>

      <div className="mt-4">
        <TrackedButton
          trackName="CapabilityTags-Submit"
          size="small"
          variation="outlined"
          disabled={!canEditTags || formHasError || !isDirty || isPending}
          onClick={() => {
            onSubmit(translateToTags());
            setIsDirty(false);
          }}
        >
          {isPending ? "Submitting..." : "Submit"}
        </TrackedButton>
      </div>
    </>
  );
}

export function CapabilityTagsPageSection({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="Tags">
      <CapabilityTags />
    </PageSection>
  );
}

export function CapabilityTags() {
  const { metadata, links, details } = useContext(SelectedCapabilityContext);
  const updateCapabilityMetadata = useUpdateCapabilityMetadata();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const queryClient = useQueryClient();
  const toast = useToast();

  const [canEditTags, setCanEditTags] = useState(false);
  const [existingTags, setExistingTags] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

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
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
        onError: () => toast.error("Could not save tags"),
      },
    );
  };

  return (
    <>
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Tagging your capability correctly helps all of us with oversight and
        incident management. However, tagging capabilities is only the first
        step — please remember to tag your cloud resources as well.{" "}
        <TrackedLink
          trackName="TaggingPolicy"
          href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
          target="_blank"
          rel="noreferrer"
          className="text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
        >
          See DFDS Tagging Policy.
        </TrackedLink>
      </p>

      <TagsForm
        defaultValues={existingTags}
        canEditTags={canEditTags}
        onSubmit={(data) => handleSubmit(data)}
        isPending={updateCapabilityMetadata.isPending}
      />
      {showSuccess && (
        <Banner variant="success" className="mt-4" countdown={3000}>
          Tags updated successfully.
        </Banner>
      )}
    </>
  );
}
