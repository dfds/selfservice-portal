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
  { label: "T&I - Competence & Engineering [ti-cae]", value: "ti-cae" },
  { label: "T&I - Ferry [ti-ferry]", value: "ti-ferry" },
  { label: "T&I - Logistics [ti-logistics]", value: "ti-logistics" },
  { label: "T&I - Group Technology & Data [ti-gtad]", value: "ti-gtad" },
  { label: "T&I - Support and Operations [ti-sao]", value: "ti-sao" },
  { label: "T&I - Enterprise Architecture [ti-arch]", value: "ti-arch" },
  { label: "T&I - TES [ti-tes]", value: "ti-tes" },
  { label: "T&I - CTO Office [ti-ctoo]", value: "ti-ctoo" },
  { label: "Ferry Division [ferry]", value: "ferry" },
  { label: "Finance Division [finance]", value: "finance" },
  { label: "Logistics Division [logistics]", value: "logistics" },
  { label: "People Division [people]", value: "people" },
];
const COMPETENCE_ENGINEERING_BUSINESS_CAPABILITIES = [
  {
    label: "Event Streaming & Data Integration",
    value: "event-streaming-data-integration",
  },
  {
    label: "Internal Developer Platform",
    value: "internal-developer-platform",
  },
  { label: "Observability & Monitoring", value: "observability-monitoring" },
  {
    label: "Platform Infrastructure & Orchestration",
    value: "platform-infrastructure-orchestration",
  },
  { label: "Research & Development", value: "research-development" },
];

const FERRY_BUSINESS_CAPABILITIES = [
  {
    label: "Adhere to regulatory requirements",
    value: "adhere-to-regulatory-requirements",
  },
  { label: "Bill Processing", value: "bill-processing" },
  { label: "Configure routes", value: "configure-routes" },
  { label: "Customs Compliance", value: "customs-compliance" },
  { label: "Customer Notifications", value: "customer-notifications" },
  { label: "Customer Onboarding", value: "customer-onboarding" },
  { label: "Equipment Management", value: "equipment-management" },
  { label: "Ferry Booking", value: "ferry-booking" },
  { label: "Ferry Scheduling", value: "ferry-scheduling" },
  { label: "Handle finance operations", value: "handle-finance-operations" },
  { label: "Imaging", value: "imaging" },
  { label: "Invoicing", value: "invoicing" },
  { label: "Labour Planning", value: "labour-planning" },
  {
    label: "Load and Discharge Execution",
    value: "load-and-discharge-execution",
  },
  { label: "Load Planning", value: "load-planning" },
  { label: "Make ferry bookings", value: "make-ferry-bookings" },
  {
    label: "Marketing and sales activities",
    value: "marketing-and-sales-activities",
  },
  { label: "Operate ports", value: "operate-ports" },
  {
    label: "Operational Monitoring and Analysis",
    value: "operational-monitoring-and-analysis",
  },
  {
    label: "Optimize capacity for vessel utilization",
    value: "optimize-capacity-for-vessel-utilization",
  },
  { label: "Optimize revenue", value: "optimize-revenue" },
  { label: "Order Intake", value: "order-intake" },
  { label: "Order Tracking", value: "order-tracking" },
  { label: "Payment Processing", value: "payment-processing" },
  { label: "Rail Booking", value: "rail-booking" },
  { label: "Rail Scheduling", value: "rail-scheduling" },
  { label: "Reporting", value: "reporting" },
  { label: "RoPax Checkin", value: "ropax-checkin" },
  { label: "Schedule voyages", value: "schedule-voyages" },
  { label: "Service Pricing", value: "service-pricing" },
  { label: "Service Pricing", value: "service-pricing-2" },
  { label: "Take Customer Payments", value: "take-customer-payments" },
  { label: "Train Management", value: "train-management" },
  { label: "Unit Management", value: "unit-management" },
  { label: "Unit Warehousing", value: "unit-warehousing" },
  { label: "Vessel Management", value: "vessel-management" },
  { label: "Visit Access Control", value: "visit-access-control" },
  { label: "Voyage Fuel Emission Optimisation", value: "voyage-fuel-emission-optimisation" },
  { label: "Yard Management", value: "yard-management" },
];

const LOGISTICS_BUSINESS_CAPABILITIES = [
  { label: "Asset management", value: "asset-management" },
  { label: "Charging hub management", value: "charging-hub-management" },
  { label: "Customer Service", value: "customer-service" },
  { label: "Customs handling", value: "customs-handling" },
  { label: "Finance", value: "finance" },
  { label: "Fleet management", value: "fleet-management" },
  { label: "Haulage procurement", value: "haulage-procurement" },
  { label: "IT Enablers – M&A", value: "it-enablers-ma" },
  { label: "IT Enablers – Messaging", value: "it-enablers-messaging" },
  { label: "IT Enablers – Observability", value: "it-enablers-observability" },
  { label: "IT Enablers – Velocity", value: "it-enablers-velocity" },
  {
    label: "IT Enablers - TMS Modernization",
    value: "it-enablers-tms-modernization",
  },
  {
    label: "Monitoring transport execution",
    value: "monitoring-transport-execution",
  },
  { label: "Networking planning", value: "networking-planning" },
  {
    label: "Operational transport planning",
    value: "operational-transport-planning",
  },
  { label: "Packaging", value: "packaging" },
  { label: "Product Management", value: "product-management" },
  { label: "Returnable Packaging", value: "returnable-packaging" },
  { label: "Sales and Marketing", value: "sales-and-marketing" },
  { label: "Supporting capabilities", value: "supporting-capabilities" },
  { label: "Team Productivity", value: "team-productivity" },
  { label: "TMS Modernization", value: "tms-modernization" },
  { label: "Transportation execution", value: "transportation-execution" },
  {
    label: "Two-way supplier communication",
    value: "two-way-supplier-communication",
  },
  { label: "Warehousing", value: "warehousing" },
];
const GROUP_TECHNOLOGY_AND_DATA_BUSINESS_CAPABILITIES = [
  { label: "App Experience Platform", value: "app-experience-platform" },
  {
    label: "Consent & Preference Management",
    value: "consent-preference-management",
  },
  {
    label: "Customer Identity & Access Management",
    value: "customer-identity-access-management",
  },
  { label: "Data Analytics", value: "data-analytics" },
  { label: "Data Engineering", value: "data-engineering" },
  { label: "Data Platform", value: "data-platform" },
  { label: "Data Science", value: "data-science" },
  {
    label: "Marketing & Campaign Management",
    value: "marketing-campaign-management",
  },
  { label: "Sales Enablement", value: "sales-enablement" },
  { label: "Web Experience Platform", value: "web-experience-platform" },
];

export const ENUM_COSTCENTER_OPTIONS = ENUM_COSTCENTER.map((item) => ({
  value: item.value.toLowerCase(),
  label: item.label,
}));

// Business Capabilities per Cost Center (default empty, easy to update)
export const BUSINESS_CAPABILITIES_BY_COSTCENTER = {
  "ti-ferry": FERRY_BUSINESS_CAPABILITIES,
  "ti-logistics": LOGISTICS_BUSINESS_CAPABILITIES,
  "ti-gtad": GROUP_TECHNOLOGY_AND_DATA_BUSINESS_CAPABILITIES,
  "ti-cae": COMPETENCE_ENGINEERING_BUSINESS_CAPABILITIES,
};

export const getBusinessCapabilitiesOptions = (costCenter) => {
  const list = BUSINESS_CAPABILITIES_BY_COSTCENTER[costCenter] || [];
  if (list.length === 0) {
    return [
      {
        value: "no-available-business-capabilities",
        label: "No selectable Business Capabilities -- contact your tribe lead",
      },
    ];
  }
  return list.map((item) => ({ value: item.value, label: item.label }));
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

export const ENUM_CLASSIFICATION = ["Private", "Confidential", "Restricted", "Public"];
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
