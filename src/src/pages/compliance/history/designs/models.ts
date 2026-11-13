import { useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { useTheme } from "@/context/ThemeContext";
import {
  type ComplianceGroup,
  useCapabilityComplianceHistory,
  useComplianceHistory,
  useCostCentreComplianceHistory,
  useRequirementComplianceHistory,
} from "@/state/remote/queries/capabilities";
import type {
  ComplianceCostCentreTotals,
  ComplianceRequirementTotals,
} from "@/state/remote/queries/compliance.types";
import { calcCompliancePct } from "../../utils";
import { type ComplianceDay, dayToDate } from "../period";
import { overallPct, requirementPct } from "../series";
import type { ComplianceDateState } from "../useComplianceDate";
import {
  type HistoryModel,
  type HistorySeries,
  OVERALL_KEY,
  buildPoints,
  selectedIndexFor,
} from "./shared";

// Categorical slots, in a fixed order per series; checked with the dataviz
// palette validator against both surfaces.
const SERIES_LIGHT = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
];
const SERIES_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
];

// The API's requirement order; a requirement keeps its colour on every page.
const REQUIREMENT_ORDER = [
  "tags",
  "external-secrets",
  "irsa-mutual-trust",
  "workload-liveness-and-readiness-probes",
  "ecr-pull-policy",
];

const SHORT_NAMES: Record<string, string> = {
  tags: "Tags",
  "external-secrets": "External Secrets",
  "irsa-mutual-trust": "IRSA",
  "workload-liveness-and-readiness-probes": "Probes",
  "ecr-pull-policy": "ECR pull",
};

// Snapshot categories are keyed by category name, not requirement id.
const CATEGORY_REQUIREMENT: Record<string, string> = {
  Tags: "tags",
  "External Secrets": "external-secrets",
  "IRSA Mutual Trust": "irsa-mutual-trust",
  "Workload Liveness and Readiness Probes":
    "workload-liveness-and-readiness-probes",
  "ECR pull policy": "ecr-pull-policy",
};

function usePalette() {
  const { isDark } = useTheme();
  // Memoised so the colour functions are stable hook dependencies.
  return useMemo(
    () => ({
      headline: isDark ? "#e2e8f0" : "#002b45",
      // Slot order is the CVD-safe one; past the last slot the hues repeat
      // dashed.
      group: (i: number) => {
        const palette = isDark ? SERIES_DARK : SERIES_LIGHT;
        return {
          color: palette[i % palette.length],
          dashed: i >= palette.length,
        };
      },
      requirement: (requirementId: string) => {
        const palette = isDark ? SERIES_DARK : SERIES_LIGHT;
        const i = REQUIREMENT_ORDER.indexOf(requirementId);
        return palette[(i < 0 ? REQUIREMENT_ORDER.length : i) % palette.length];
      },
    }),
    [isDark],
  );
}

/** The items inside the history range; the "page" scope has none and keeps all. */
function inRange<T extends { date: ComplianceDay }>(
  items: readonly T[],
  date: ComplianceDateState,
): readonly T[] {
  const r = date.range?.resolved;
  return r ? items.filter((i) => i.date >= r.start && i.date <= r.end) : items;
}

function rate(totals: { compliantCount: number; totalCapabilities: number }) {
  return totals.totalCapabilities === 0
    ? null
    : calcCompliancePct(totals.compliantCount, totals.totalCapabilities);
}

function requirementSeries(
  totals: readonly ComplianceRequirementTotals[],
  names: Map<string, string>,
  color: (id: string) => string,
): HistorySeries[] {
  return totals.map((r) => {
    const name = names.get(r.requirementId) ?? r.displayName ?? r.categoryName;
    return {
      key: r.requirementId,
      name,
      shortName: SHORT_NAMES[r.requirementId] ?? name,
      color: color(r.requirementId),
    };
  });
}

/** Requirement display names from the latest overall summary. */
function useRequirementNames(): Map<string, string> {
  const { data } = useComplianceHistory();
  return useMemo(() => {
    const latest = data?.items[data.items.length - 1];
    return new Map(
      (latest?.requirements ?? []).map((r) => [
        r.requirementId,
        r.displayName ?? r.categoryName,
      ]),
    );
  }, [data]);
}

function groupKey(g: { kind: string; costCentre: string | null }): string {
  return g.kind === "costCentre" ? `cc:${g.costCentre?.toLowerCase()}` : g.kind;
}

function groupName(g: { kind: string; costCentre: string | null }): string {
  if (g.kind === "rogue") return "Rogue (no cost centre)";
  if (g.kind === "orphaned") return "Orphaned (no members)";
  return g.costCentre ?? "";
}

const KIND_ORDER: Record<string, number> = {
  costCentre: 0,
  rogue: 1,
  orphaned: 2,
};

function groupSeries(
  groups: readonly ComplianceCostCentreTotals[],
  slot: (i: number) => { color: string; dashed: boolean },
): HistorySeries[] {
  // A fixed order keeps each group's colour when the API reorders them.
  const sorted = [...groups].sort(
    (a, b) =>
      (KIND_ORDER[a.kind] ?? 3) - (KIND_ORDER[b.kind] ?? 3) ||
      groupName(a).localeCompare(groupName(b)),
  );
  return sorted.map((g, i) => ({
    key: groupKey(g),
    name: groupName(g),
    shortName:
      g.kind === "rogue"
        ? "Rogue"
        : g.kind === "orphaned"
        ? "Orphaned"
        : groupName(g),
    ...slot(i),
  }));
}

function findGroup(
  groups: readonly ComplianceCostCentreTotals[],
  key: string,
): ComplianceCostCentreTotals | undefined {
  return groups.find((g) => groupKey(g) === key);
}

/** Overview: all capabilities, then each cost centre, rogue and orphaned. */
export function useCostCentresHistoryModel(
  date: ComplianceDateState,
): HistoryModel {
  const { data, isFetched } = useComplianceHistory();
  const palette = usePalette();
  return useMemo(() => {
    const items = data?.items ?? [];
    const latest = items[items.length - 1];
    const series: HistorySeries[] = [
      {
        key: OVERALL_KEY,
        name: "Fully compliant capabilities",
        shortName: "Fully compliant capabilities",
        color: palette.headline,
      },
      ...groupSeries(latest?.costCentres ?? [], palette.group),
    ];
    const points = buildPoints(
      inRange(items, date),
      date.view,
      series,
      (item, key) => {
        if (key === OVERALL_KEY) return overallPct(item);
        const g = findGroup(item.costCentres, key);
        return g ? rate(g) : null;
      },
      (item) =>
        `${item.fullyCompliantCapabilities} of ${item.totalCapabilities}`,
    );
    return {
      kind: "rate",
      subject: "fully compliant capabilities",
      breakdown: "cost centre",
      series,
      points,
      selectedIndex: selectedIndexFor(points, date.view, date.selected),
      isFetched: isFetched || !!data,
    };
  }, [
    data,
    isFetched,
    palette.headline,
    palette.group,
    date.view,
    date.selected,
    date.range?.resolved.start,
    date.range?.resolved.end,
  ]);
}

/** Requirements overview: all capabilities, then each requirement. */
export function useRequirementsHistoryModel(
  date: ComplianceDateState,
): HistoryModel {
  const { data, isFetched } = useComplianceHistory();
  const palette = usePalette();
  const names = useRequirementNames();
  return useMemo(() => {
    const items = data?.items ?? [];
    const latest = items[items.length - 1];
    const series: HistorySeries[] = [
      {
        key: OVERALL_KEY,
        name: "Fully compliant capabilities",
        shortName: "Fully compliant capabilities",
        color: palette.headline,
      },
      ...requirementSeries(
        latest?.requirements ?? [],
        names,
        palette.requirement,
      ),
    ];
    const points = buildPoints(
      inRange(items, date),
      date.view,
      series,
      (item, key) =>
        key === OVERALL_KEY ? overallPct(item) : requirementPct(item, key),
      (item) =>
        `${item.fullyCompliantCapabilities} of ${item.totalCapabilities}`,
    );
    return {
      kind: "rate",
      subject: "fully compliant capabilities",
      breakdown: "requirement",
      series,
      points,
      selectedIndex: selectedIndexFor(points, date.view, date.selected),
      isFetched: isFetched || !!data,
    };
    // palette.requirement depends only on the theme, which palette.headline tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    isFetched,
    palette.headline,
    names,
    date.view,
    date.selected,
    date.range?.resolved.start,
    date.range?.resolved.end,
  ]);
}

/** One cost centre (or rogue/orphaned): its rate, then each requirement within it. */
export function useCostCentreHistoryModel(
  date: ComplianceDateState,
  group: ComplianceGroup,
): HistoryModel {
  const { data, isFetched } = useCostCentreComplianceHistory(group);
  const palette = usePalette();
  const names = useRequirementNames();
  return useMemo(() => {
    const items = data?.items ?? [];
    const latest = items[items.length - 1];
    const series: HistorySeries[] = [
      {
        key: OVERALL_KEY,
        name: "Fully compliant",
        shortName: "Fully compliant",
        color: palette.headline,
      },
      ...requirementSeries(
        latest?.requirements ?? [],
        names,
        palette.requirement,
      ),
    ];
    const points = buildPoints(
      inRange(items, date),
      date.view,
      series,
      (item, key) => {
        if (key === OVERALL_KEY) return rate(item);
        const r = item.requirements.find((x) => x.requirementId === key);
        return r ? rate(r) : null;
      },
      (item) => `${item.compliantCount} of ${item.totalCapabilities}`,
    );
    return {
      kind: "rate",
      subject: "fully compliant capabilities",
      breakdown: "requirement",
      series,
      points,
      selectedIndex: selectedIndexFor(points, date.view, date.selected),
      isFetched: isFetched || !!data,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    isFetched,
    palette.headline,
    names,
    date.view,
    date.selected,
    date.range?.resolved.start,
    date.range?.resolved.end,
  ]);
}

/** One requirement: its rate, then each cost centre, rogue and orphaned. */
export function useRequirementHistoryModel(
  date: ComplianceDateState,
  requirementId: string | null,
): HistoryModel {
  const { data, isFetched } = useRequirementComplianceHistory(requirementId);
  const palette = usePalette();
  return useMemo(() => {
    const items = data?.items ?? [];
    const latest = items[items.length - 1];
    const series: HistorySeries[] = [
      {
        key: OVERALL_KEY,
        name: "All capabilities",
        shortName: "All capabilities",
        color: palette.headline,
      },
      ...groupSeries(latest?.costCentres ?? [], palette.group),
    ];
    const points = buildPoints(
      inRange(items, date),
      date.view,
      series,
      (item, key) => {
        if (key === OVERALL_KEY) return rate(item.totals);
        const g = findGroup(item.costCentres, key);
        return g ? rate(g) : null;
      },
      (item) =>
        `${item.totals.compliantCount} of ${item.totals.totalCapabilities}`,
    );
    return {
      kind: "rate",
      subject: "capabilities meeting the requirement",
      breakdown: "cost centre",
      series,
      points,
      selectedIndex: selectedIndexFor(points, date.view, date.selected),
      isFetched: isFetched || !!data,
    };
  }, [
    data,
    isFetched,
    palette.headline,
    palette.group,
    date.view,
    date.selected,
    date.range?.resolved.start,
    date.range?.resolved.end,
  ]);
}

// The capability history endpoint takes a trailing day count, 1–1100.
const CAPABILITY_HISTORY_MAX_DAYS = 1100;

/** Days back from today that cover `date`'s range start. */
function capabilityHistoryDays(date: ComplianceDateState): number {
  const start = date.range?.resolved.start;
  if (!start) return 180;
  const days =
    differenceInCalendarDays(dayToDate(date.today), dayToDate(start)) + 1;
  return Math.min(CAPABILITY_HISTORY_MAX_DAYS, Math.max(1, days));
}

/**
 * One capability, per day: the share of its evaluated requirements met, then
 * each requirement's score. A snapshot without a score falls back to 100 or 0
 * from the status.
 */
export function useCapabilityHistoryModel(
  capabilityId: string | null,
  categories: readonly { categoryName: string; displayName?: string | null }[],
  date: ComplianceDateState,
): HistoryModel {
  const { data, isFetched } = useCapabilityComplianceHistory(
    capabilityId,
    capabilityHistoryDays(date),
  );
  const palette = usePalette();
  return useMemo(() => {
    const items = data?.items ?? [];
    const series: HistorySeries[] = [
      {
        key: OVERALL_KEY,
        name: "Requirements met",
        shortName: "Requirements met",
        color: palette.headline,
      },
      ...categories.map((c) => {
        const id = CATEGORY_REQUIREMENT[c.categoryName] ?? c.categoryName;
        const name = c.displayName || c.categoryName;
        return {
          key: c.categoryName,
          name,
          shortName: SHORT_NAMES[id] ?? name,
          color: palette.requirement(id),
        };
      }),
    ];
    const points = buildPoints(
      inRange(items, date),
      date.view,
      series,
      (item, key) => {
        if (key === OVERALL_KEY) {
          const evaluated = item.categories.filter(
            (c) => c.status !== "Unknown",
          );
          if (evaluated.length === 0) return null;
          const met = evaluated.filter((c) => c.status === "Compliant").length;
          return Math.round((met / evaluated.length) * 100);
        }
        const category = item.categories.find((c) => c.categoryName === key);
        if (!category || category.status === "Unknown") return null;
        if (typeof category.score === "number") {
          return Math.round(category.score * 10) / 10;
        }
        return category.status === "Compliant" ? 100 : 0;
      },
      (item) => `${item.compliantCategories} of ${item.totalCategories} met`,
    );
    return {
      kind: "rate",
      subject: "requirement scores",
      breakdown: "requirement",
      series,
      points,
      selectedIndex: selectedIndexFor(points, date.view, date.selected),
      isFetched: isFetched || !!data,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    isFetched,
    palette.headline,
    categories,
    date.view,
    date.selected,
    date.range?.resolved.start,
    date.range?.resolved.end,
  ]);
}
