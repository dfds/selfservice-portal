// Wire formats of the selfservice-api /compliance routes. Dates are UTC
// calendar days as "YYYY-MM-DD"; timestamps are ISO 8601 with a "Z" suffix.

export type ComplianceStatus = "Compliant" | "NonCompliant" | "Unknown";

export type ComplianceCostCentreKind = "costCentre" | "rogue" | "orphaned";

export type ComplianceSummary = {
  totalCapabilities: number;
  fullyCompliantCapabilities: number;
  nonCompliantCapabilities: number;
  unknownCapabilities: number;
};

export type CostCentreCategoryBreakdown = {
  categoryName: string;
  compliantCount: number;
  nonCompliantCount: number;
};

export type CostCentreCompliance = {
  /** The label: a cost centre spelling, or "rogue" / "orphaned". */
  costCentre: string;
  kind: ComplianceCostCentreKind;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  categories: CostCentreCategoryBreakdown[];
};

/** Cost centres (case-insensitive, ordered by name), then rogue, then orphaned. */
export type AllCostCentresCompliance = {
  items: CostCentreCompliance[];
};

export type RequirementByCostCentre = {
  /** The `dfds.cost.centre` value as stored, case-sensitive; null or "" when missing. */
  costCentre: string | null;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
};

export type RequirementComplianceSummary = {
  requirementId: string;
  categoryName: string;
  displayName: string;
  description: string | null;
  helpUrl: string | null;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
  byCostCentre: RequirementByCostCentre[];
};

export type RequirementsCompliance = {
  items: RequirementComplianceSummary[];
};

export type ComplianceRequirementTotals = {
  requirementId: string;
  categoryName: string;
  displayName: string | null;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
};

export type ComplianceCostCentreTotals = {
  /** Null for the rogue and orphaned groups. */
  costCentre: string | null;
  kind: ComplianceCostCentreKind;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
};

export type ComplianceDailySummary = ComplianceSummary & {
  date: string;
  capturedAt: string;
  requirements: ComplianceRequirementTotals[];
  costCentres: ComplianceCostCentreTotals[];
};

export type ComplianceHistory = {
  /** The oldest stored day, or null when nothing has been recorded. */
  oldestDate: string | null;
  /** Oldest first. Days without a snapshot are absent. */
  items: ComplianceDailySummary[];
};

export type CostCentreComplianceHistoryEntry = {
  date: string;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
  /** Empty for days captured before per-group totals were stored. */
  requirements: ComplianceRequirementTotals[];
};

export type CostCentreComplianceHistory = {
  oldestDate: string | null;
  /** Oldest first. Days without a snapshot, or without the group, are absent. */
  items: CostCentreComplianceHistoryEntry[];
};

export type RequirementComplianceHistoryEntry = {
  date: string;
  totals: ComplianceRequirementTotals;
  /** Cost centres, then rogue and orphaned; empty for days captured before per-group totals were stored. */
  costCentres: ComplianceCostCentreTotals[];
};

export type RequirementComplianceHistory = {
  oldestDate: string | null;
  requirementId: string;
  /** Oldest first. Days without a snapshot are absent. */
  items: RequirementComplianceHistoryEntry[];
};

export type ComplianceCategoryStatus = {
  categoryName: string;
  status: ComplianceStatus;
};

export type CapabilityComplianceHistoryEntry = {
  date: string;
  overallStatus: ComplianceStatus;
  compliantCategories: number;
  totalCategories: number;
  categories: ComplianceCategoryStatus[];
};

export type CapabilityComplianceHistory = {
  /** Oldest first. Days without a snapshot, or without this capability, are absent. */
  items: CapabilityComplianceHistoryEntry[];
};
