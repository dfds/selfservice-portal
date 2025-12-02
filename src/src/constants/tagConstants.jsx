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
  {
    label: "Core DFDS Infrasctructure",
    value: "ToolAccess",
  },
  { label: "Azure OpenAI Services", value: "AI" },
  {
    label: "Native Integrations",
    value: "ThirdPartyLimitations",
  },
  {
    label: "Third-party SaaS",
    value: "PartnerPackageLimitation",
  },
  { label: "Partner Packages", value: "Other" },
];
export const ENUM_AZURERG_USAGE_OPTIONS = ENUM_AZURERG_USAGE.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));

export const ENUM_CAPABILITY_AI_USAGE = [
  {
    label: "This capability provides AI services",
    value: "true",
  },
  {
    label: "This capability does not provide AI services",
    value: "false"
  },
];
export const ENUM_CAPABILITY_AI_USAGE_OPTIONS = ENUM_CAPABILITY_AI_USAGE.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));
