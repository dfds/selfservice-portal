import { type CopilotCreditUsage } from "@/state/remote/queries/copilot";
import { type ChartSeries, metric } from "@/pages/copilot/shared";

type CreditGroup = CopilotCreditUsage["groups"][number];

const PALETTE = [
  { color: "#0e7cc1", darkColor: "#60a5fa" },
  { color: "#4caf50" },
  { color: "#ed8800" },
  { color: "#be1e2d", darkColor: "#f87171" },
  { color: "#7c3aed", darkColor: "#a78bfa" },
  { color: "#0d9488", darkColor: "#2dd4bf" },
  { color: "#db2777", darkColor: "#f472b6" },
  { color: "#002b45", darkColor: "#94a3b8" },
  { color: "#ca8a04", darkColor: "#facc15" },
  { color: "#65a30d", darkColor: "#a3e635" },
  { color: "#0891b2", darkColor: "#22d3ee" },
  { color: "#9333ea", darkColor: "#c084fc" },
  { color: "#c2410c", darkColor: "#fb923c" },
  { color: "#4f46e5", darkColor: "#818cf8" },
  { color: "#15803d", darkColor: "#4ade80" },
  { color: "#a16207", darkColor: "#fde047" },
];

export function rangeDays(from: string, to: string): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const last = to < today ? to : today;
  const out: string[] = [];
  for (
    let d = new Date(`${from}T00:00:00Z`);
    d.toISOString().slice(0, 10) <= last;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function rangeHours(from: string, to: string, since?: string): string[] {
  const end = Math.min(
    new Date(`${to}T23:00:00Z`).getTime(),
    Date.now() - (Date.now() % 3_600_000),
  );
  const start = Math.max(
    new Date(`${from}T00:00:00Z`).getTime(),
    since ? new Date(since).getTime() : 0,
  );
  const out: string[] = [];
  for (let t = start; t <= end; ) {
    out.push(new Date(t).toISOString().slice(0, 13) + ":00:00Z");
    t += 3_600_000;
  }
  return out;
}

/**
 * Series keys use s0, s1, etc. because Recharts interprets dots in model names as paths.
 */
export function pivot(
  xs: string[],
  xKey: "day" | "hour",
  groups: CreditGroup[],
  entity: "login" | "model",
  name: string,
  cumulative: boolean,
) {
  const sums = new Map<string, number>();
  for (const g of groups) {
    const k = String(g[entity] ?? "");
    sums.set(k, (sums.get(k) ?? 0) + metric(g.totals, name));
  }
  const names = [...sums.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const index = new Map(names.map((n, i) => [n, i]));
  const at = new Map(xs.map((x, i) => [x, i]));
  const values = xs.map(() => names.map(() => 0));
  for (const g of groups) {
    const i = at.get(String(g[xKey]));
    const s = index.get(String(g[entity] ?? ""));
    if (i !== undefined && s !== undefined)
      values[i][s] += metric(g.totals, name);
  }
  const running = names.map(() => 0);
  const data = xs.map((x, i) => {
    const row: Record<string, string | number> = { [xKey]: x };
    names.forEach((_, s) => {
      running[s] = cumulative ? running[s] + values[i][s] : values[i][s];
      row[`s${s}`] = running[s];
    });
    return row;
  });
  const series: ChartSeries[] = names.map((n, s) => ({
    key: `s${s}`,
    label: n || "unknown",
    kind: "line",
    ...PALETTE[s % PALETTE.length],
  }));
  return { data, series };
}

export function fmtHour(h: string): string {
  return new Date(h).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtHourLong(h: string): string {
  return new Date(h).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function topRows(
  groups: CreditGroup[],
  key: "login" | "model",
  name: string,
) {
  return [...groups]
    .sort((a, b) => metric(b.totals, name) - metric(a.totals, name))
    .slice(0, 10)
    .map((g) => ({
      name: String(g[key] ?? ""),
      value: metric(g.totals, name),
    }));
}
