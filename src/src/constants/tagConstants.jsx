// Environment tag for Capabilities
export const ENUM_ENV = [
  { label: "Development", value: "dev" },
  { label: "Testing", value: "test" },
  { label: "Staging", value: "staging" },
  { label: "User Acceptance Testing", value: "uat" },
  { label: "Training", value: "training" },
  { label: "Production", value: "prod" },
  { label: "Mixed", value: "mixed" },
];
export const ENUM_ENV_OPTIONS = ENUM_ENV.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));
export const ENUM_COSTCENTER = [
  { label: "T&I - Ferry [ti-ferry]", value: "ti-ferry" },
  { label: "T&I - Logistics [ti-logistics]", value: "ti-logistics" },
  { label: "T&I - Group Technology and Data [ti-gtad]", value: "ti-gtad" },
  { label: "T&I - Architecture [ti-arch]", value: "ti-arch" },
  { label: "T&I - Support and Operation [ti-sao]", value: "ti-sao" },
  { label: "T&I - Platform [ti-platform]", value: "ti-platform" },
  { label: "T&I - Other [ti-other]", value: "ti-other" },
  { label: "Finance [finance]", value: "finance" },
];

const FERRY_BUSINESS_CAPABILITIES = [
  "Load Planning",
  "Visit Access Control",
  "Imaging",
  "Load and Discharge Execution",
  "Labour Planning",
  "Service Pricing",
  "Equipment Management",
  "Unit Management",
  "Yard Management",
  "Unit Warehousing",
  "Vessel Management",
  "Train Management",
  "Reporting",
  "Operational Monitoring and Analysis",
  "Adhere to regulatory requirements",
  "Configure routes",
  "Handle finance operations",
  "Make ferry bookings",
  "Marketing and sales activities",
  "Operate ports",
  "Optimize capacity for vessel utilization",
  "Optimize revenue",
  "Schedule voyages",
  "Take Customer Payments",
];

const LOGISTICS_BUSINESS_CAPABILITIES = [
  "Product Management",
  "Sales and Marketing",
  "Customer Service",
  "Finance",
  "Fleet management",
  "Transportation execution",
  "Customs handling",
  "Monitoring transport execution",
  "Haulage procurement",
  "Two-way supplier communication",
  "Operational transport planning",
  "Warehousing",
  "Networking planning",
  "Charging hub management",
  "Asset management",
  "Supporting capabilities",
  "Packaging",
  "IT Enablers - M&A",
  "IT Enablers - Velocity",
  "IT Enablers - Messaging",
  "IT Enablers - Observability",
  "IT Enablers - TMS Modernization",
];

export const ENUM_COSTCENTER_OPTIONS = ENUM_COSTCENTER.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));

// Business Capabilities per Cost Center (default empty, easy to update)
export const BUSINESS_CAPABILITIES_BY_COSTCENTER = {
  "ti-ferry": FERRY_BUSINESS_CAPABILITIES,
  "ti-logistics": LOGISTICS_BUSINESS_CAPABILITIES,
};

export const getBusinessCapabilitiesOptions = (costCenter) => {
  const list = BUSINESS_CAPABILITIES_BY_COSTCENTER[costCenter] || [];
  if (list.length === 0) {
    return [
      {
        value: "",
        label: "No selectable Business Capabilities -- contact your tribe lead",
        isDisabled: true,
      },
    ];
  }
  return list.map((item) => ({ value: item, label: item }));
};

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
    label: "Core DFDS Infrastructure",
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

export const ENUM_CAPABILITY_CONTAINS_AI = [
  {
    label: "This capability contains AI services",
    value: "true",
  },
  {
    label: "This capability does not contain AI services",
    value: "false",
  },
];
export const ENUM_CAPABILITY_CONTAINS_AI_OPTIONS =
  ENUM_CAPABILITY_CONTAINS_AI.map((item) => ({
    value: item.value.toLowerCase(),
    label: item.label,
  }));
