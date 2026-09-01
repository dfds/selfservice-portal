import { ENUM_COSTCENTER } from "@/constants/tagConstants";

const COST_CENTRE_LABEL_MAP = new Map<string, string>(
  (ENUM_COSTCENTER as { value: string; label: string }[]).map((cc) => [
    cc.value,
    cc.label,
  ]),
);

export function getCostCentreLabel(value: string): string {
  const raw = COST_CENTRE_LABEL_MAP.get(value);
  if (!raw) return value;
  return raw.replace(/\s*\[.*?\]\s*$/, "").trim();
}

export function parseCostCentre(cap: any): string | null {
  if (!cap?.jsonMetadata) return null;
  try {
    const meta = JSON.parse(cap.jsonMetadata);
    return meta["dfds.cost.centre"] || null;
  } catch {
    return null;
  }
}

export function parseMetadata(
  jsonMetadata: string | null | undefined,
): Record<string, string> {
  if (!jsonMetadata) return {};
  try {
    const parsed = JSON.parse(jsonMetadata);
    if (parsed && typeof parsed === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        out[k] = v == null ? "" : String(v);
      }
      return out;
    }
  } catch {
    /* swallow */
  }
  return {};
}

export function complianceTier(pct: number): "green" | "orange" | "red" {
  return pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";
}

export function complianceColor(pct: number): string {
  return pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
}
