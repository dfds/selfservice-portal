import React, { useEffect, useContext, useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { TabbedPageSection } from "@/components/PageSection";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import Select from "react-select";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";
import { Banner } from "@/components/ui/banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";
import { useRybbit } from "@/RybbitContext";
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

const selectPortalProps = {
  menuPortalTarget: document.body,
  menuPosition: "fixed",
};

function TagField({ label, description, error, required, children }) {
  return (
    <div className="flex flex-col @[626px]:flex-row @[626px]:items-start py-3 border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0 gap-2 @[626px]:gap-4">
      <div className="@[626px]:w-[220px] @[626px]:flex-shrink-0">
        <div className="font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 tracking-[0.04em]">
          {label}
          {required && (
            <span
              title="Required for compliance"
              aria-label="Required for compliance"
              className="text-[#be1e2d] dark:text-[#f87171] font-semibold"
            >
              {" *"}
            </span>
          )}
        </div>
        {description && (
          <div className="text-[0.6875rem] text-[#afafaf] dark:text-slate-500 leading-[1.4] mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="flex-1 @[626px]:flex @[626px]:justify-end">
        <div className="w-full @[626px]:w-[390px]">
          {children}
          {error && (
            <div className="font-mono text-[0.625rem] text-[#be1e2d] mt-1">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TagsForm({
  canEditTags,
  onSubmit,
  onDirtyChange,
  defaultValues,
  isPending = false,
}) {
  const { isDark } = useTheme();
  const selectStyles = getSelectStyles(isDark);
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

  const requiredErrors = {
    "dfds.cost.centre": !selectedCostCenterOption
      ? "A cost centre must be set"
      : undefined,
    "dfds.businessCapability": !selectedBusinessCapabilityOption
      ? "A Business Capability must be set"
      : undefined,
    "dfds.env": !selectedEnvOption ? "An environment must be set" : undefined,
    "dfds.data.classification": !selectedClassificationOption
      ? "Data classification must be set"
      : undefined,
    "dfds.service.criticality": !selectedCriticalityOption
      ? "Service criticality must be set"
      : undefined,
    "dfds.service.availability": !selectedAvailabilityOption
      ? "Service availability must be set"
      : undefined,
  };

  const formHasError = Object.values(requiredErrors).some(Boolean);

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

  // Derive dirty by comparing the current selection against the saved values, so
  // reverting an edit clears the unsaved-changes indicator.
  const currentTags = translateToTags();
  const isDirty = Object.keys(currentTags).some(
    (key) => (currentTags[key] ?? "") !== (defaultValues?.[key] ?? ""),
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Restore every field to the saved values, clearing any unsaved edits
  // (including fields the user set that had no saved value).
  const resetToDefaults = () => {
    const values = defaultValues || {};
    // Use null (not undefined) for empty fields: react-select treats an
    // undefined `value` as uncontrolled and keeps the stale selection.
    setSelectedCostCenterOption(
      ENUM_COSTCENTER_OPTIONS.find(
        (o) => o.value === values["dfds.cost.centre"],
      ) || null,
    );
    const costCentre = values["dfds.cost.centre"];
    setSelectedBusinessCapabilityOption(
      costCentre
        ? getBusinessCapabilitiesOptions(costCentre).find(
            (o) => o.value === values["dfds.businessCapability"],
          ) || null
        : null,
    );
    setSelectedClassificationOption(
      ENUM_CLASSIFICATION_OPTIONS.find(
        (o) => o.value === values["dfds.data.classification"],
      ) || null,
    );
    setSelectedCriticalityOption(
      ENUM_CRITICALITY_OPTIONS.find(
        (o) => o.value === values["dfds.service.criticality"],
      ) || null,
    );
    setSelectedAvailabilityOption(
      ENUM_AVAILABILITY_OPTIONS.find(
        (o) => o.value === values["dfds.service.availability"],
      ) || null,
    );
    setSelectedAzureRGUsageOption(
      ENUM_AZURERG_USAGE_OPTIONS.find(
        (o) => o.value === values["dfds.azure.purpose"],
      ) || null,
    );
    setSelectedEnvOption(
      ENUM_ENV_OPTIONS.find((o) => o.value === values["dfds.env"]) || null,
    );
    setSelectedCapabilityContainsAIOption(
      ENUM_CAPABILITY_CONTAINS_AI_OPTIONS.find(
        (o) => o.value === values["dfds.capability.contains-ai"],
      ) || null,
    );
  };

  return (
    <>
      {canEditTags && formHasError && (
        <div className="mb-3 font-mono text-[0.625rem] text-[#be1e2d] tracking-[0.04em]">
          Some tags are not compliant. Please correct them and resubmit.
        </div>
      )}

      <div className="mb-3 font-mono text-[0.625rem] text-[#afafaf] dark:text-slate-500 tracking-[0.04em]">
        <span className="text-[#be1e2d] dark:text-[#f87171] font-semibold">
          *
        </span>{" "}
        Required for compliance
      </div>

      <div className="tag-list @container">
        <TagField
          label="dfds.cost.centre"
          required
          description="Required for internal analysis and cost aggregation tools such as FinOut."
          error={canEditTags ? requiredErrors["dfds.cost.centre"] : undefined}
        >
          <Select
            {...selectPortalProps}
            options={ENUM_COSTCENTER_OPTIONS}
            value={selectedCostCenterOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCostCenterOption(e);
              setSelectedBusinessCapabilityOption(null);
            }}
          />
        </TagField>

        <TagField
          label="dfds.businessCapability"
          required
          description="If in doubt, contact your enterprise architect"
          error={
            canEditTags ? requiredErrors["dfds.businessCapability"] : undefined
          }
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
            }}
          />
        </TagField>

        <TagField
          label="dfds.env"
          required
          description="Select the environment for this capability."
          error={canEditTags ? requiredErrors["dfds.env"] : undefined}
        >
          <Select
            {...selectPortalProps}
            options={ENUM_ENV_OPTIONS}
            value={selectedEnvOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedEnvOption(e);
            }}
          />
        </TagField>

        <TagField
          label="dfds.data.classification"
          required
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
          error={
            canEditTags ? requiredErrors["dfds.data.classification"] : undefined
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_CLASSIFICATION_OPTIONS}
            value={selectedClassificationOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedClassificationOption(e);
            }}
          />
        </TagField>

        <TagField
          label="dfds.service.criticality"
          required
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
          error={
            canEditTags ? requiredErrors["dfds.service.criticality"] : undefined
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_CRITICALITY_OPTIONS}
            value={selectedCriticalityOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCriticalityOption(e);
            }}
          />
        </TagField>

        <TagField
          label="dfds.service.availability"
          required
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
          error={
            canEditTags
              ? requiredErrors["dfds.service.availability"]
              : undefined
          }
        >
          <Select
            {...selectPortalProps}
            options={ENUM_AVAILABILITY_OPTIONS}
            value={selectedAvailabilityOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedAvailabilityOption(e);
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
            value={selectedAzureRGUsageOption ?? null}
            isDisabled={!canEditTags}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedAzureRGUsageOption(e);
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
            value={selectedCapabilityContainsAIOption ?? null}
            styles={selectStyles}
            onChange={(e) => {
              setSelectedCapabilityContainsAIOption(e);
            }}
          />
        </TagField>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <TrackedButton
          trackName="CapabilityTags-Submit"
          size="small"
          variation="outlined"
          disabled={!canEditTags || !isDirty || isPending}
          onClick={() => {
            onSubmit(translateToTags());
          }}
        >
          {isPending ? "Submitting..." : "Submit"}
        </TrackedButton>
        <TrackedButton
          trackName="CapabilityTags-Reset"
          size="small"
          variation="link"
          disabled={!canEditTags || !isDirty || isPending}
          onClick={resetToDefaults}
        >
          Discard
        </TrackedButton>
      </div>
    </>
  );
}

const CUSTOM_TAG_PREFIX = "dfds.other.";

function TabLabel({ children, dirty }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {dirty && (
        <span
          title="Unsaved changes"
          aria-label="Unsaved changes"
          className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ed8800]"
        />
      )}
    </span>
  );
}

const customInputClass =
  "w-full h-[30px] px-2 font-mono text-[0.75rem] rounded-[5px] border border-[#d9dcde] dark:border-[#334155] bg-white dark:bg-[#0f172a] text-[#002b45] dark:text-[#e2e8f0] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]";

function CustomTagsForm({
  existingTags,
  canEditTags,
  onSubmit,
  onDirtyChange,
  isPending = false,
}) {
  const [rows, setRows] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState("");

  // The custom tags saved on the capability (dfds.other.* keys, normalised to
  // strings) — the baseline the current rows are compared against for dirtiness.
  const initialCustom = Object.fromEntries(
    Object.entries(existingTags || {})
      .filter(([key]) => key.startsWith(CUSTOM_TAG_PREFIX))
      .map(([key, value]) => [key, value == null ? "" : String(value)]),
  );

  // Initialise (and refresh after save) rows from the capability metadata.
  useEffect(() => {
    setRows(
      Object.entries(initialCustom).map(([key, value], i) => ({
        id: i,
        key,
        value,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTags]);

  // Derive dirty by comparing the current rows against the saved custom tags, so
  // reverting edits (or adding then removing a tag) clears the indicator.
  const currentCustom = Object.fromEntries(
    rows.map((row) => [row.key, row.value]),
  );
  const initialKeys = Object.keys(initialCustom);
  const currentKeys = Object.keys(currentCustom);
  const isDirty =
    initialKeys.length !== currentKeys.length ||
    currentKeys.some((key) => currentCustom[key] !== initialCustom[key]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Restore rows to the saved custom tags, discarding edits, additions and
  // removals as well as any in-progress new-tag input.
  const resetRows = () => {
    setRows(
      Object.entries(initialCustom).map(([key, value], i) => ({
        id: i,
        key,
        value,
      })),
    );
    setNewKey("");
    setNewValue("");
    setAddError("");
  };

  const updateRowValue = (id, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value } : row)),
    );
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addRow = () => {
    const trimmed = newKey.trim();
    if (!trimmed) {
      setAddError("Enter a tag name.");
      return;
    }
    const fullKey = CUSTOM_TAG_PREFIX + trimmed;
    if (rows.some((row) => row.key === fullKey)) {
      setAddError("A custom tag with this name already exists.");
      return;
    }
    setRows((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 0,
        key: fullKey,
        value: newValue,
      },
    ]);
    setNewKey("");
    setNewValue("");
    setAddError("");
  };

  return (
    <div className="@container">
      <p className="text-[0.8125rem] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Custom tags let you attach free-text metadata to this capability under
        the <span className="font-mono">{CUSTOM_TAG_PREFIX}</span> namespace.
        Use them for capability-specific information that isn&apos;t covered by
        the authoritative tags.
      </p>

      <div className="tag-list">
        {rows.map((row) => (
          <TagField key={row.id} label={row.key}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={customInputClass}
                value={row.value}
                disabled={!canEditTags}
                placeholder="Value"
                onChange={(e) => updateRowValue(row.id, e.target.value)}
              />
              {canEditTags && (
                <IconButton
                  size="sm"
                  colorScheme="destructive"
                  aria-label={`Remove ${row.key}`}
                  onClick={() => removeRow(row.id)}
                >
                  <X size={14} />
                </IconButton>
              )}
            </div>
          </TagField>
        ))}

        {rows.length === 0 && (
          <EmptyState>
            {canEditTags
              ? "No custom tags yet. Add one below."
              : "No custom tags."}
          </EmptyState>
        )}
      </div>

      {canEditTags && (
        <div className="mt-4 pt-4 border-t border-[#eeeeee] dark:border-[#1e2d3d]">
          <div className="font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] mb-2">
            Add custom tag
          </div>
          <div className="flex flex-col gap-2 @[626px]:flex-row @[626px]:items-center">
            <div className="flex items-center flex-1 rounded-[5px] border border-[#d9dcde] dark:border-[#334155] bg-white dark:bg-[#0f172a] focus-within:border-[#0e7cc1] dark:focus-within:border-[#60a5fa] overflow-hidden">
              <span className="font-mono text-[0.75rem] text-[#afafaf] dark:text-slate-500 pl-2 pr-0.5 whitespace-nowrap select-none">
                {CUSTOM_TAG_PREFIX}
              </span>
              <input
                type="text"
                className="w-full h-[30px] pr-2 font-mono text-[0.75rem] bg-transparent text-[#002b45] dark:text-[#e2e8f0] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b] focus:outline-none"
                value={newKey}
                placeholder="myCustomTag"
                onChange={(e) => {
                  setNewKey(e.target.value);
                  setAddError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addRow();
                }}
              />
            </div>
            <input
              type="text"
              className={`${customInputClass} @[626px]:flex-1`}
              value={newValue}
              placeholder="Value"
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addRow();
              }}
            />
            <TrackedButton
              trackName="CapabilityTags-AddCustom"
              size="small"
              variation="outlined"
              disabled={!newKey.trim()}
              onClick={addRow}
            >
              Add
            </TrackedButton>
          </div>
          {addError && (
            <div className="font-mono text-[0.625rem] text-[#be1e2d] mt-1">
              {addError}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <TrackedButton
          trackName="CapabilityTags-SubmitCustom"
          size="small"
          variation="outlined"
          disabled={!canEditTags || !isDirty || isPending}
          onClick={() => {
            onSubmit(rows);
          }}
        >
          {isPending ? "Submitting..." : "Submit"}
        </TrackedButton>
        <TrackedButton
          trackName="CapabilityTags-ResetCustom"
          size="small"
          variation="link"
          disabled={!canEditTags || !isDirty || isPending}
          onClick={resetRows}
        >
          Discard
        </TrackedButton>
      </div>
    </div>
  );
}

export function CapabilityTagsPageSection({ anchorId }) {
  return <CapabilityTags anchorId={anchorId} />;
}

export function CapabilityTags({ anchorId }) {
  const { metadata, links, details } = useContext(SelectedCapabilityContext);
  const updateCapabilityMetadata = useUpdateCapabilityMetadata();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { trackEvent } = useRybbit();

  const [canEditTags, setCanEditTags] = useState(false);
  const [existingTags, setExistingTags] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [authoritativeDirty, setAuthoritativeDirty] = useState(false);
  const [customDirty, setCustomDirty] = useState(false);

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

  // The backend replaces the entire metadata blob on save, so every submit must
  // send the full object. Each tab merges its own changes onto the existing tags.
  const submitMetadata = (fullMetadata) => {
    trackEvent("capability:metadata:submitted", {
      capability_id: details?.id,
    });
    updateCapabilityMetadata.mutate(
      {
        capabilityDefinition: details,
        payload: {
          jsonMetadata: fullMetadata,
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
          trackEvent("capability:metadata:succeeded", {
            capability_id: details?.id,
          });
        },
        onError: (err) => {
          toast.error("Could not save tags");
          trackEvent("capability:metadata:failed", {
            capability_id: details?.id,
            error_kind: err?.name || "unknown",
          });
        },
      },
    );
  };

  const handleAuthoritativeSubmit = (authoritativeTags) => {
    // Preserve all custom (and any other) keys, overlay the authoritative values.
    submitMetadata({ ...existingTags, ...authoritativeTags });
  };

  const handleCustomSubmit = (rows) => {
    // Keep everything except custom keys, then replace the custom set with the
    // current rows (handles edits, additions and removals).
    const base = Object.fromEntries(
      Object.entries(existingTags).filter(
        ([key]) => !key.startsWith(CUSTOM_TAG_PREFIX),
      ),
    );
    const custom = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    submitMetadata({ ...base, ...custom });
  };

  const headlineChildren = (
    <TrackedLink
      trackName="TaggingPolicy"
      href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-[0.6875rem] text-[#0e7cc1] dark:text-[#60a5fa] hover:underline"
    >
      Tagging Policy →
    </TrackedLink>
  );

  const tabs = {
    authoritative: <TabLabel dirty={authoritativeDirty}>Standard</TabLabel>,
    custom: <TabLabel dirty={customDirty}>Custom</TabLabel>,
  };

  const tabsContent = {
    authoritative: (
      <>
        <p className="text-[0.8125rem] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
          Tagging your capability correctly helps all of us with oversight and
          incident management. However, tagging capabilities is only the first
          step — please remember to tag your cloud resources as well.{" "}
          <TrackedLink
            trackName="TaggingPolicy"
            href={
              "https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"
            }
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
          onSubmit={handleAuthoritativeSubmit}
          onDirtyChange={setAuthoritativeDirty}
          isPending={updateCapabilityMetadata.isPending}
        />
      </>
    ),
    custom: (
      <CustomTagsForm
        existingTags={existingTags}
        canEditTags={canEditTags}
        onSubmit={handleCustomSubmit}
        onDirtyChange={setCustomDirty}
        isPending={updateCapabilityMetadata.isPending}
      />
    ),
  };

  return (
    <>
      <UnsavedChangesPrompt
        when={authoritativeDirty || customDirty}
        message="You have unsaved tag changes that will be lost if you leave this page."
      />
      <TabbedPageSection
        id={anchorId}
        headline="Tags"
        headlineChildren={headlineChildren}
        tabs={tabs}
        tabsContent={tabsContent}
        keepMounted
        footer={
          showSuccess && (
            <Banner variant="success" className="mt-4" countdown={3000}>
              Tags updated successfully.
            </Banner>
          )
        }
      />
    </>
  );
}
