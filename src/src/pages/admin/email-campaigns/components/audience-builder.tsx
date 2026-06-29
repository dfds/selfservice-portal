import React, { useState, useEffect, useMemo } from "react";
import { useResolveAudience } from "@/state/remote/queries/emailCampaigns";
import { useGetRoles } from "@/state/remote/queries/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { ChevronDown, ChevronRight, Plus, Trash2, Users } from "lucide-react";
import { ENUM_COSTCENTER } from "@/constants/tagConstants";

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
  key?: string;
}

interface AudienceConfig {
  mode: "all" | "specific" | "filter";
  capabilityIds?: string[];
  userEmails?: string[];
  filters?: FilterCondition[];
}

type TargetType = "Capability" | "User";

interface AudienceBuilderProps {
  value: AudienceConfig;
  onChange: (value: AudienceConfig) => void;
  targetType?: TargetType;
  recipientFilter?: string;
  onRecipientFilterChange?: (v: string) => void;
}

type FieldScope = "user" | "capability";

interface FieldOption {
  value: string;
  label: string;
  scope: FieldScope;
}

const CAPABILITY_FIELD_OPTIONS: FieldOption[] = [
  { value: "status", label: "Status", scope: "capability" },
  { value: "name", label: "Capability Name", scope: "capability" },
  { value: "memberCount", label: "Member Count", scope: "capability" },
  { value: "createdAt", label: "Created At", scope: "capability" },
  {
    value: "requirementScore",
    label: "Requirement Score",
    scope: "capability",
  },
  {
    value: "metadataKeyExists",
    label: "Metadata Key Exists",
    scope: "capability",
  },
  {
    value: "metadataKeyValue",
    label: "Metadata Key = Value",
    scope: "capability",
  },
  { value: "awsAccountCount", label: "AWS Account Count", scope: "capability" },
  {
    value: "azureResourceGroupCount",
    label: "Azure Resource Count",
    scope: "capability",
  },
  {
    value: "activeMembershipApplicationCount",
    label: "Active Membership Applications",
    scope: "capability",
  },
  { value: "cost", label: "Monthly Cost (USD)", scope: "capability" },
];

const USER_FIELD_OPTIONS: FieldOption[] = [
  { value: "email", label: "Email", scope: "user" },
  { value: "displayName", label: "Display Name", scope: "user" },
  { value: "lastSeen", label: "Last Seen", scope: "user" },
  // capabilityCostCentre matches a user via their capabilities, so it's capability-scoped.
  {
    value: "capabilityCostCentre",
    label: "Capability Cost Centre",
    scope: "capability",
  },
];

const NUMERIC_OPS = [
  { value: "eq", label: "=" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
];

const DATE_OPS = [
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
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
  memberCount: NUMERIC_OPS,
  createdAt: DATE_OPS,
  requirementScore: NUMERIC_OPS,
  metadataKeyExists: [{ value: "eq", label: "equals" }],
  metadataKeyValue: [{ value: "eq", label: "=" }],
  awsAccountCount: NUMERIC_OPS,
  azureResourceGroupCount: NUMERIC_OPS,
  activeMembershipApplicationCount: NUMERIC_OPS,
  cost: NUMERIC_OPS,
  // User-targeted fields
  email: [
    { value: "eq", label: "equals" },
    { value: "contains", label: "contains" },
  ],
  displayName: [
    { value: "eq", label: "equals" },
    { value: "contains", label: "contains" },
  ],
  lastSeen: DATE_OPS,
  capabilityCostCentre: [{ value: "in", label: "is one of" }],
};

export function AudienceBuilder({
  value,
  onChange,
  targetType = "Capability",
  recipientFilter,
  onRecipientFilterChange,
}: AudienceBuilderProps) {
  const isUserTarget = targetType === "User";
  // User campaigns can also be narrowed by capability attributes (a user is included if they
  // belong to a matching capability), so the User target offers the user fields plus every
  // capability field. The Capability target is unchanged.
  const FIELD_OPTIONS = isUserTarget
    ? [...USER_FIELD_OPTIONS, ...CAPABILITY_FIELD_OPTIONS]
    : CAPABILITY_FIELD_OPTIONS;
  const userScopedOptions = FIELD_OPTIONS.filter((f) => f.scope === "user");
  const capabilityScopedOptions = FIELD_OPTIONS.filter(
    (f) => f.scope === "capability",
  );
  const isCapabilityField = (field: string) =>
    FIELD_OPTIONS.find((f) => f.value === field)?.scope === "capability";
  const defaultField = isUserTarget ? "email" : "status";
  const defaultOperator = isUserTarget ? "contains" : "eq";

  const resolveAudience = useResolveAudience();
  const [resolved, setResolved] = useState<any>(null);
  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(
    new Set(),
  );
  const [capIdsRaw, setCapIdsRaw] = useState(() =>
    (value.capabilityIds || []).join(", "),
  );
  const [emailsRaw, setEmailsRaw] = useState(() =>
    (value.userEmails || []).join(", "),
  );

  useEffect(() => {
    setCapIdsRaw((value.capabilityIds || []).join(", "));
  }, [(value.capabilityIds || []).join(",")]);

  useEffect(() => {
    setEmailsRaw((value.userEmails || []).join(", "));
  }, [(value.userEmails || []).join(",")]);

  const toggleCapability = (id: string) => {
    setExpandedCapabilities((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addFilter = () => {
    const filters = [
      ...(value.filters || []),
      { field: defaultField, operator: defaultOperator, value: "" },
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
      {
        payload: {
          audienceJson: JSON.stringify(value),
          recipientFilter: recipientFilter || undefined,
          targetType,
        },
      },
      {
        onSuccess: (data: any) => setResolved(data),
        onError: () => setResolved(null),
      },
    );
  };

  return (
    <div className="space-y-4">
      <SectionLabel className="block">Audience</SectionLabel>

      <InfoAlert variant="info">
        <p className="mb-1.5">
          The audience decides <strong>who actually receives this email</strong>
          .{" "}
          {isUserTarget
            ? "This is a User campaign — each matching person gets one email, and template variables resolve against that person."
            : "This is a Capability campaign — one email is sent per matching capability, addressed to its members."}
        </p>
        <ul className="space-y-0.5 pl-4 list-disc">
          <li>
            <strong>{isUserTarget ? "All Users" : "All Capabilities"}</strong> —
            no filtering; everyone{" "}
            {isUserTarget ? "in the platform" : "capability"} is included.
          </li>
          <li>
            <strong>Specific</strong> — only the{" "}
            {isUserTarget ? "email addresses" : "capability IDs"} you list.
          </li>
          <li>
            <strong>Filter</strong> — a rule-based audience; add conditions and{" "}
            <em>Preview audience</em> to see who matches before sending.
          </li>
        </ul>
        {isUserTarget && (
          <p className="mt-1.5">
            A condition on a{" "}
            <span className="inline-flex items-center px-1 py-px rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[0.6875rem] font-medium align-baseline">
              capability
            </span>{" "}
            field includes a user when they belong to at least one matching
            capability — but the email still renders <em>all</em> of that user's
            capabilities inside any{" "}
            <code className="font-mono text-[0.75rem]">
              {"{{#each User.Capabilities}}"}
            </code>{" "}
            loop.
          </p>
        )}
      </InfoAlert>

      <div className="flex gap-2">
        {(["all", "specific", "filter"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              onChange({ ...value, mode });
              setResolved(null);
            }}
            className={`px-3 py-1.5 rounded-md text-[0.75rem] font-medium border cursor-pointer transition-colors ${
              value.mode === mode
                ? "bg-[#002b45] text-white border-[#002b45] dark:bg-slate-600 dark:border-slate-500"
                : "bg-transparent text-secondary border-card hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            {mode === "all"
              ? isUserTarget
                ? "All Users"
                : "All Capabilities"
              : mode === "specific"
              ? "Specific"
              : "Filter"}
          </button>
        ))}
      </div>

      {value.mode === "specific" && !isUserTarget && (
        <div>
          <Label className="text-[0.75rem] text-muted mb-1 block">
            Capability IDs (comma-separated)
          </Label>
          <Input
            value={capIdsRaw}
            onChange={(e) => setCapIdsRaw(e.target.value)}
            onBlur={() =>
              onChange({
                ...value,
                capabilityIds: capIdsRaw
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="cap-id-1, cap-id-2"
          />
        </div>
      )}

      {value.mode === "specific" && isUserTarget && (
        <div>
          <Label className="text-[0.75rem] text-muted mb-1 block">
            Email addresses (comma or newline separated)
          </Label>
          <textarea
            value={emailsRaw}
            onChange={(e) => setEmailsRaw(e.target.value)}
            onBlur={() =>
              onChange({
                ...value,
                userEmails: emailsRaw
                  .split(/[,\n]/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="alice@dfds.com, bob@dfds.com"
            rows={4}
            className="w-full rounded-md border border-card bg-surface px-3 py-2 text-[0.75rem] text-primary font-mono placeholder:text-muted"
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
                    key: undefined,
                  });
                }}
                className="h-9 rounded-md border border-card bg-surface px-2 text-[0.75rem] text-primary"
              >
                {isUserTarget ? (
                  <>
                    <optgroup label="User">
                      {userScopedOptions.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Capability">
                      {capabilityScopedOptions.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  FIELD_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))
                )}
              </select>
              {isUserTarget && isCapabilityField(filter.field) && (
                <span
                  title="Matches users who belong to a capability matching this filter"
                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[0.625rem] font-medium shrink-0"
                >
                  capability
                </span>
              )}
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(i, { operator: e.target.value })}
                className="h-9 rounded-md border border-card bg-surface px-2 text-[0.75rem] text-primary"
              >
                {(OPERATOR_OPTIONS[filter.field] || []).map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              {filter.field === "metadataKeyValue" ? (
                <>
                  <Input
                    value={filter.key || ""}
                    onChange={(e) => updateFilter(i, { key: e.target.value })}
                    placeholder="Key"
                    className="w-[130px]"
                  />
                  <span className="text-muted text-[0.75rem] flex-shrink-0">
                    =
                  </span>
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(i, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-1"
                  />
                </>
              ) : filter.field === "status" ? (
                <select
                  value={filter.value}
                  onChange={(e) => updateFilter(i, { value: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-card bg-surface px-2 text-[0.75rem] text-primary"
                >
                  <option value="">— select —</option>
                  <option value="Active">Active</option>
                  <option value="Pending Deletion">Pending Deletion</option>
                  <option value="Deleted">Deleted</option>
                </select>
              ) : filter.field === "capabilityCostCentre" ? (
                <CostCentrePicker
                  value={filter.value}
                  onChange={(v) => updateFilter(i, { value: v })}
                />
              ) : (
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(i, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />
              )}
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

      {onRecipientFilterChange !== undefined && (
        <RoleFilterPicker
          value={recipientFilter || ""}
          onChange={onRecipientFilterChange}
        />
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
          <span className="text-[0.75rem] text-secondary">
            {isUserTarget ? (
              <>
                <strong>{resolved.totalRecipients}</strong> users
                {resolved.unmatchedEmails &&
                  resolved.unmatchedEmails.length > 0 && (
                    <span className="text-warning ml-2">
                      ({resolved.unmatchedEmails.length} unmatched email
                      {resolved.unmatchedEmails.length === 1 ? "" : "s"})
                    </span>
                  )}
              </>
            ) : (
              <>
                <strong>{resolved.totalCapabilities}</strong> capabilities,{" "}
                <strong>{resolved.totalRecipients}</strong> recipients
              </>
            )}
          </span>
        )}
      </div>

      {resolved && isUserTarget && resolved.users?.length > 0 && (
        <div className="max-h-96 overflow-auto border border-card rounded-lg">
          <table className="w-full text-[0.75rem]">
            <thead>
              <tr className="border-b border-card bg-surface-subtle">
                <th className="text-left px-3 py-1.5 font-medium text-muted">
                  Email
                </th>
                <th className="text-left px-3 py-1.5 font-medium text-muted">
                  Display Name
                </th>
              </tr>
            </thead>
            <tbody>
              {resolved.users.map((u: any) => (
                <tr
                  key={u.userId}
                  className="border-b border-card last:border-0"
                >
                  <td className="px-3 py-1.5 text-primary font-mono">
                    {u.email}
                  </td>
                  <td className="px-3 py-1.5 text-secondary">
                    {u.displayName || (
                      <span className="text-muted italic">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resolved &&
        isUserTarget &&
        (resolved.unmatchedEmails || []).length > 0 && (
          <div className="text-[0.6875rem] text-warning border border-warning/40 bg-warning/5 rounded-md px-3 py-2">
            The following emails did not match any user:{" "}
            <span className="font-mono">
              {(resolved.unmatchedEmails || []).join(", ")}
            </span>
          </div>
        )}

      {resolved && !isUserTarget && resolved.capabilities?.length > 0 && (
        <div className="max-h-96 overflow-auto border border-card rounded-lg">
          <table className="w-full text-[0.75rem]">
            <thead>
              <tr className="border-b border-card bg-surface-subtle">
                <th className="text-left px-3 py-1.5 font-medium text-muted">
                  Capability
                </th>
                <th className="text-right px-3 py-1.5 font-medium text-muted">
                  Recipients
                </th>
              </tr>
            </thead>
            <tbody>
              {resolved.capabilities.map((cap: any) => {
                const isExpanded = expandedCapabilities.has(cap.id);
                const recipients: any[] = cap.recipients ?? [];
                return (
                  <React.Fragment key={cap.id}>
                    <tr
                      className="border-b border-card cursor-pointer hover:bg-surface-subtle"
                      onClick={() => toggleCapability(cap.id)}
                    >
                      <td className="px-3 py-1.5 text-primary">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown
                              size={12}
                              className="text-muted flex-shrink-0"
                            />
                          ) : (
                            <ChevronRight
                              size={12}
                              className="text-muted flex-shrink-0"
                            />
                          )}
                          <span className="truncate max-w-[300px]">
                            {cap.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right text-muted font-mono">
                        {cap.memberCount}
                      </td>
                    </tr>
                    {isExpanded && recipients.length === 0 && (
                      <tr className="border-b border-card last:border-0 bg-surface-subtle">
                        <td
                          className="pl-8 pr-3 py-1.5 text-muted italic"
                          colSpan={2}
                        >
                          No recipients
                        </td>
                      </tr>
                    )}
                    {isExpanded &&
                      recipients.map((r: any) => (
                        <tr
                          key={r.email}
                          className="border-b border-card last:border-0 bg-surface-subtle"
                        >
                          <td
                            className="pl-8 pr-3 py-1 text-secondary"
                            colSpan={2}
                          >
                            <span className="font-medium">{r.displayName}</span>
                            <span className="text-muted ml-2">{r.email}</span>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface RoleFilterPickerProps {
  value: string;
  onChange: (v: string) => void;
}

function RoleFilterPicker({ value, onChange }: RoleFilterPickerProps) {
  const { data } = useGetRoles("");
  const roles: Array<{ id: string; name: string }> = (data as any[]) ?? [];

  const selected = useMemo(() => {
    return new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s.toLowerCase()),
    );
  }, [value]);

  const toggle = (roleName: string) => {
    const lower = roleName.toLowerCase();
    const next = new Set(selected);
    if (next.has(lower)) next.delete(lower);
    else next.add(lower);
    const ordered = roles
      .map((r) => r.name)
      .filter((n) => next.has(n.toLowerCase()));
    onChange(ordered.join(","));
  };

  return (
    <div>
      <Label className="text-[0.75rem] mb-1 block">
        Recipient Filter (optional)
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {roles.length === 0 ? (
          <span className="text-[0.6875rem] text-muted">Loading roles…</span>
        ) : (
          roles.map((r) => {
            const isSelected = selected.has(r.name.toLowerCase());
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle(r.name)}
                className={`px-2.5 py-1 rounded-md text-[0.75rem] font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#002b45] text-white border-[#002b45] dark:bg-slate-600 dark:border-slate-500"
                    : "bg-transparent text-secondary border-card hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                {r.name}
              </button>
            );
          })
        )}
      </div>
      <span className="text-[0.6875rem] text-muted mt-1 block">
        Optionally limit recipients to members holding any of the selected RBAC
        roles. Leave empty to include everyone.
      </span>
    </div>
  );
}

interface CostCentrePickerProps {
  value: string;
  onChange: (v: string) => void;
}

function CostCentrePicker({ value, onChange }: CostCentrePickerProps) {
  const selected = useMemo(() => {
    return new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s.toLowerCase()),
    );
  }, [value]);

  const toggle = (slug: string) => {
    const lower = slug.toLowerCase();
    const next = new Set(selected);
    if (next.has(lower)) next.delete(lower);
    else next.add(lower);
    const ordered = ENUM_COSTCENTER.map((c) => c.value).filter((s) =>
      next.has(s.toLowerCase()),
    );
    onChange(ordered.join(","));
  };

  return (
    <div className="flex-1 flex flex-wrap gap-1.5 py-1">
      {ENUM_COSTCENTER.map((c) => {
        const isSelected = selected.has(c.value.toLowerCase());
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => toggle(c.value)}
            className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-medium border transition-colors cursor-pointer ${
              isSelected
                ? "bg-[#002b45] text-white border-[#002b45] dark:bg-slate-600 dark:border-slate-500"
                : "bg-transparent text-secondary border-card hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
