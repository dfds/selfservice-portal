export const ENUM_COSTCENTER = [
  { label: "T&I - Ferry [ti-ferry]", value: "ti-ferry" },
  { label: "T&I - Logistics [ti-logistics]", value: "ti-logistics" },
  { label: "T&I - Group Technology and Data [ti-gtad]", value: "ti-gtad" },
  { label: "T&I - Architecture [ti-arch]", value: "ti-arch" },
  { label: "T&I - Support and Operation [ti-sao]", value: "ti-sao" },
  { label: "T&I - Innovation [ti-inno]", value: "ti-inno" },
  { label: "T&I - Platform [ti-platform]", value: "ti-platform" },
  {
    label: "T&I - Competence Center [ti-competence]",
    value: "ti-competence",
  },
  { label: "T&I - Other [ti-other]", value: "ti-other" },
  { label: "Finance [finance]", value: "finance" },
  { label: "Ferry [ferry]", value: "ferry" },
  { label: "Logistics [logistics]", value: "logistics" },
];

export const ENUM_COSTCENTER_OPTIONS = ENUM_COSTCENTER.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
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
