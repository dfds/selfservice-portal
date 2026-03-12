import React, { useState } from "react";
import { useResolveAudience } from "@/state/remote/queries/emailBroadcasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Plus, Trash2, Users } from "lucide-react";

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface AudienceConfig {
  mode: "all" | "specific" | "filter";
  capabilityIds?: string[];
  filters?: FilterCondition[];
}

interface AudienceBuilderProps {
  value: AudienceConfig;
  onChange: (value: AudienceConfig) => void;
}

const FIELD_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "name", label: "Capability Name" },
  { value: "memberCount", label: "Member Count" },
  { value: "createdAt", label: "Created At" },
  { value: "requirementScore", label: "Requirement Score" },
  { value: "metadataKeyExists", label: "Metadata Key Exists" },
];

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  status: [
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
  ],
  name: [
    { value: "eq", label: "equals" },
    { value: "contains", label: "contains" },
  ],
  memberCount: [
    { value: "eq", label: "=" },
    { value: "gte", label: ">=" },
    { value: "lte", label: "<=" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
  ],
  createdAt: [
    { value: "gte", label: ">=" },
    { value: "lte", label: "<=" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
  ],
  requirementScore: [
    { value: "eq", label: "=" },
    { value: "gte", label: ">=" },
    { value: "lte", label: "<=" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
  ],
  metadataKeyExists: [{ value: "eq", label: "equals" }],
};

export function AudienceBuilder({ value, onChange }: AudienceBuilderProps) {
  const resolveAudience = useResolveAudience();
  const [resolved, setResolved] = useState<any>(null);

  const addFilter = () => {
    const filters = [
      ...(value.filters || []),
      { field: "status", operator: "eq", value: "" },
    ];
    onChange({ ...value, filters });
  };

  const removeFilter = (index: number) => {
    const filters = (value.filters || []).filter((_, i) => i !== index);
    onChange({ ...value, filters });
  };

  const updateFilter = (index: number, updates: Partial<FilterCondition>) => {
    const filters = (value.filters || []).map((f, i) =>
      i === index ? { ...f, ...updates } : f,
    );
    onChange({ ...value, filters });
  };

  const handleResolve = () => {
    resolveAudience.mutate(
      { payload: { audienceJson: JSON.stringify(value) } },
      {
        onSuccess: (data: any) => setResolved(data),
        onError: () => setResolved(null),
      },
    );
  };

  return (
    <div className="space-y-4">
      <SectionLabel className="block">Audience</SectionLabel>

      <div className="flex gap-2">
        {(["all", "specific", "filter"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              onChange({ ...value, mode });
              setResolved(null);
            }}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium border cursor-pointer transition-colors ${
              value.mode === mode
                ? "bg-[#002b45] text-white border-[#002b45] dark:bg-slate-600 dark:border-slate-500"
                : "bg-transparent text-secondary border-card hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            {mode === "all"
              ? "All Capabilities"
              : mode === "specific"
                ? "Specific"
                : "Filter"}
          </button>
        ))}
      </div>

      {value.mode === "specific" && (
        <div>
          <Label className="text-[12px] text-muted mb-1 block">
            Capability IDs (comma-separated)
          </Label>
          <Input
            value={(value.capabilityIds || []).join(", ")}
            onChange={(e) =>
              onChange({
                ...value,
                capabilityIds: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="cap-id-1, cap-id-2"
          />
        </div>
      )}

      {value.mode === "filter" && (
        <div className="space-y-2">
          {(value.filters || []).map((filter, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={filter.field}
                onChange={(e) => {
                  const ops = OPERATOR_OPTIONS[e.target.value] || [];
                  updateFilter(i, {
                    field: e.target.value,
                    operator: ops[0]?.value || "eq",
                  });
                }}
                className="h-9 rounded-md border border-card bg-surface px-2 text-[12px] text-primary"
              >
                {FIELD_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(i, { operator: e.target.value })}
                className="h-9 rounded-md border border-card bg-surface px-2 text-[12px] text-primary"
              >
                {(OPERATOR_OPTIONS[filter.field] || []).map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <Input
                value={filter.value}
                onChange={(e) => updateFilter(i, { value: e.target.value })}
                placeholder="Value"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeFilter(i)}
                className="p-1.5 text-muted hover:text-red-500 cursor-pointer bg-transparent border-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addFilter}
            className="gap-1.5"
          >
            <Plus size={14} />
            Add Filter
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResolve}
          disabled={resolveAudience.isPending}
          className="gap-1.5"
        >
          <Users size={14} />
          {resolveAudience.isPending ? "Resolving..." : "Resolve Audience"}
        </Button>

        {resolved && (
          <span className="text-[12px] text-secondary">
            <strong>{resolved.totalCapabilities}</strong> capabilities,{" "}
            <strong>{resolved.totalRecipients}</strong> recipients
          </span>
        )}
      </div>

      {resolved && resolved.capabilities?.length > 0 && (
        <div className="max-h-48 overflow-auto border border-card rounded-lg">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-card bg-surface-subtle">
                <th className="text-left px-3 py-1.5 font-medium text-muted">
                  Capability
                </th>
                <th className="text-right px-3 py-1.5 font-medium text-muted">
                  Members
                </th>
              </tr>
            </thead>
            <tbody>
              {resolved.capabilities.map((cap: any) => (
                <tr key={cap.id} className="border-b border-card last:border-0">
                  <td className="px-3 py-1.5 text-primary truncate max-w-[300px]">
                    {cap.name}
                  </td>
                  <td className="px-3 py-1.5 text-right text-muted font-mono">
                    {cap.memberCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
