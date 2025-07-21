import { labelValue } from "@rjsf/utils";

export const ENUM_COSTCENTER = [
  "ti-ferry",
  "ti-logistics",
  "ti-pace",
  "ti-ctai",
  "ti-data",
  "ti-arch",
  "ti-sao",
  "ti-inno",
  "ti-platform",
  "ti-competence",
  "ti-other",
  "finance",
  "ferry",
  "logistics",
];
export const ENUM_COSTCENTER_OPTIONS = ENUM_COSTCENTER.map((item) => ({
  value: item.toLowerCase(),
  label: item,
}));

export const ENUM_CRITICALITY = ["Low", "Medium", "High"];
export const ENUM_CRITICALITY_OPTIONS = ENUM_CRITICALITY.map((item) => ({
  value: item.toLowerCase(),
  label: item,
}));

export const ENUM_AVAILABILITY = ["Low", "Medium", "High"];
export const ENUM_AVAILABILITY_OPTIONS = ENUM_AVAILABILITY.map((item) => ({
  value: item.toLowerCase(),
  label: item,
}));

export const ENUM_CLASSIFICATION = ["Private", "Confidential", "Restricted"];
export const ENUM_CLASSIFICATION_OPTIONS = ENUM_CLASSIFICATION.map((item) => ({
  value: item.toLowerCase(),
  label: item,
}));

export const ENUM_AZURERG_USAGE = [
  {label: "EntraID, Office365, Dynamics365, PowerBI, etc.", value: "ToolAccess"},
  {label: "OpenAI Services", value: "AI"},
  {label: "Third party SaaS limited to Azure", value: "ThirdPartyLimitations"},
  {label: "Partner packages with tigh Azure coupling", value: "PartnerPackageLimitation"},
  {label: "Other", value: "Other"}
];
export const ENUM_AZURERG_USAGE_OPTIONS = ENUM_AZURERG_USAGE.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));
