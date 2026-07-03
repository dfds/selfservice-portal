export type MetadataFilter = { key: string; value: string };

export type MetadataMode = "and" | "or";

export type MetadataIndex = {
  keys: string[];
  values: Record<string, string[]>;
};

// Aggregate every metadata key + per-key value set seen across a set of parsed
// metadata records. Drives the key combobox and per-key value suggestions.
export function buildMetadataIndex(
  metas: Record<string, string>[],
): MetadataIndex {
  const valuesByKey = new Map<string, Set<string>>();
  for (const meta of metas) {
    for (const [k, v] of Object.entries(meta)) {
      let set = valuesByKey.get(k);
      if (!set) {
        set = new Set();
        valuesByKey.set(k, set);
      }
      set.add(v);
    }
  }
  const keys = Array.from(valuesByKey.keys()).sort();
  const values: Record<string, string[]> = {};
  for (const k of keys) values[k] = Array.from(valuesByKey.get(k)!).sort();
  return { keys, values };
}

// AND: every non-empty filter must match
// OR: at least one must match
export function matchesMetadata(
  meta: Record<string, string>,
  filters: MetadataFilter[],
  mode: MetadataMode,
): boolean {
  const active = filters.filter((f) => f.key);
  if (active.length === 0) return true;
  const matches = (f: MetadataFilter) => {
    const v = meta[f.key];
    if (v === undefined) return false;
    if (f.value && v !== f.value) return false; // empty value = "any"
    return true;
  };
  return mode === "or" ? active.some(matches) : active.every(matches);
}

export function parseTagParam(raw: string): MetadataFilter {
  const eq = raw.indexOf("=");
  if (eq === -1) return { key: raw, value: "" };
  return { key: raw.slice(0, eq), value: raw.slice(eq + 1) };
}

export function formatTagParam(f: MetadataFilter): string {
  return f.value ? `${f.key}=${f.value}` : f.key;
}
