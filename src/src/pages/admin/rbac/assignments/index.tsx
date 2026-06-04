import React, { useContext, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search, X } from "lucide-react";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { TabGroup } from "@/components/ui/TabGroup";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IconButton } from "@/components/ui/IconButton";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useMutationToast } from "@/hooks/useMutationToast";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import { ssuRequest } from "@/state/remote/query";
import PreAppContext from "@/preAppContext";
import {
  EntityPicker,
  EntityTypeBadge,
  GroupPicker,
  PermissionPicker,
  RolePicker,
  ScopePicker,
  type PermissionSelection,
  type ScopeValue,
} from "@/components/rbac";
import {
  useSearchMembers,
  useRbacGroups,
  useGetRoles,
  useGrantPermissionsBulk,
  useGrantRolesBulk,
  useAddGroupMember,
  useRevokePermission,
  useRevokeRoleGrant,
  useRemoveGroupMember,
  type MemberSummary,
} from "@/state/remote/queries/rbac";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { Trash2 } from "lucide-react";

type AssignmentTab = "permissions" | "roles" | "memberships";

const TABS: { id: AssignmentTab; label: string }[] = [
  { id: "permissions", label: "Permission Grants" },
  { id: "roles", label: "Role Grants" },
  { id: "memberships", label: "Group Memberships" },
];

type EntityTypeFilter = "All" | "User" | "ServicePrincipal" | "Group";

interface CommonRow {
  rowKey: string;
  grantId?: string;
  entityType: "User" | "ServicePrincipal" | "Group";
  entityId: string;
  entityLabel: string;
  entityEmail?: string;
}

interface PermissionRow extends CommonRow {
  namespace: string;
  permission: string;
  scopeType: string;
  resource: string;
  resourceLabel: string;
}

interface RoleRow extends CommonRow {
  roleId: string;
  roleLabel: string;
  scopeType: string;
  resource: string;
  resourceLabel: string;
}

interface MembershipRow extends CommonRow {
  groupId: string;
  groupLabel: string;
  membershipId: string;
}

export default function RbacAssignmentsPage() {
  const [tab, setTab] = useState<AssignmentTab>("permissions");
  const [entityType, setEntityType] = useState<EntityTypeFilter>("All");
  const [namespace, setNamespace] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"All" | "Global" | "Capability">("All");
  const [search, setSearch] = useState("");
  const [showGrant, setShowGrant] = useState(false);

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="RBAC Assignments"
        subtitle="Browse and edit all permission grants, role grants, and group memberships across the platform."
      />

      <div className="mb-4">
        <TabGroup<AssignmentTab>
          tabs={TABS}
          value={tab}
          onChange={(next) => {
            setTab(next);
            setNamespace("");
          }}
        />
      </div>

      <FilterBar
        tab={tab}
        entityType={entityType}
        onEntityTypeChange={setEntityType}
        namespace={namespace}
        onNamespaceChange={setNamespace}
        scope={scopeFilter}
        onScopeChange={setScopeFilter}
        search={search}
        onSearchChange={setSearch}
        onGrantClick={() => setShowGrant(true)}
      />

      <div className="mt-4">
        {tab === "permissions" && (
          <PermissionsTab
            entityType={entityType}
            namespace={namespace}
            scope={scopeFilter}
            search={search}
          />
        )}
        {tab === "roles" && (
          <RolesTab
            entityType={entityType}
            scope={scopeFilter}
            search={search}
          />
        )}
        {tab === "memberships" && (
          <MembershipsTab
            entityType={entityType === "Group" ? "All" : entityType}
            search={search}
          />
        )}
      </div>

      <GrantDialog
        tab={tab}
        open={showGrant}
        onOpenChange={setShowGrant}
      />
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({
  tab,
  entityType,
  onEntityTypeChange,
  namespace,
  onNamespaceChange,
  scope,
  onScopeChange,
  search,
  onSearchChange,
  onGrantClick,
}: {
  tab: AssignmentTab;
  entityType: EntityTypeFilter;
  onEntityTypeChange: (v: EntityTypeFilter) => void;
  namespace: string;
  onNamespaceChange: (v: string) => void;
  scope: "All" | "Global" | "Capability";
  onScopeChange: (v: "All" | "Global" | "Capability") => void;
  search: string;
  onSearchChange: (v: string) => void;
  onGrantClick: () => void;
}) {
  const entityTypeOptions: { value: EntityTypeFilter; label: string }[] =
    tab === "memberships"
      ? [
          { value: "All", label: "Any" },
          { value: "User", label: "Users" },
          { value: "ServicePrincipal", label: "Service accounts" },
        ]
      : [
          { value: "All", label: "Any" },
          { value: "User", label: "Users" },
          { value: "ServicePrincipal", label: "Service accounts" },
          { value: "Group", label: "Groups" },
        ];

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <SectionLabel className="block mb-1">Search</SectionLabel>
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter rows…"
            className="text-sm font-mono pl-8"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="min-w-[140px]">
        <SectionLabel className="block mb-1">Entity type</SectionLabel>
        <select
          value={entityType}
          onChange={(e) => onEntityTypeChange(e.target.value as EntityTypeFilter)}
          className="w-full h-9 text-xs font-mono border border-input rounded-[5px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
        >
          {entityTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {tab === "permissions" && (
        <div className="min-w-[140px]">
          <SectionLabel className="block mb-1">Namespace</SectionLabel>
          <NamespaceSelect value={namespace} onChange={onNamespaceChange} />
        </div>
      )}

      {tab !== "memberships" && (
        <div className="min-w-[120px]">
          <SectionLabel className="block mb-1">Scope</SectionLabel>
          <select
            value={scope}
            onChange={(e) =>
              onScopeChange(e.target.value as "All" | "Global" | "Capability")
            }
            className="w-full h-9 text-xs font-mono border border-input rounded-[5px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
          >
            <option value="All">Any</option>
            <option value="Global">Global</option>
            <option value="Capability">Capability</option>
          </select>
        </div>
      )}

      <Button
        variant="action"
        size="sm"
        onClick={onGrantClick}
        className="h-9 px-3 text-xs gap-1.5 md:self-end"
      >
        <Plus size={13} strokeWidth={1.75} />
        Grant
      </Button>
    </div>
  );
}

function NamespaceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Pull namespaces from the full members + groups permission queries that
  // are already in the cache (no extra fetch — best-effort population).
  const { data: rolesData } = useGetRoles("");
  const roles: any[] = (rolesData as any[]) ?? [];
  void roles; // namespaces come from elsewhere; this just nudges deps

  // Collect namespaces from query cache keys
  const namespaces = useMemo(() => {
    const set = new Set<string>();
    const cache = queryClient.getQueryCache().getAll();
    cache.forEach((q) => {
      const k = q.queryKey;
      if (
        Array.isArray(k) &&
        (k[0] === "rbac") &&
        (k[1] === "user-permissions" || k[1] === "group-permissions")
      ) {
        const data = q.state.data as any[] | undefined;
        if (Array.isArray(data)) {
          data.forEach((p) => p?.namespace && set.add(p.namespace));
        }
      }
    });
    return Array.from(set).sort();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 text-xs font-mono border border-input rounded-[5px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
    >
      <option value="">Any</option>
      {namespaces.map((ns) => (
        <option key={ns} value={ns}>
          {ns}
        </option>
      ))}
    </select>
  );
}

// ── Shared data fetching ──────────────────────────────────────────────────────

const MAX_MEMBERS = 200;

function useEntityIndex(entityType: EntityTypeFilter) {
  const needsMembers = entityType === "All" || entityType === "User" || entityType === "ServicePrincipal";
  const needsGroups = entityType === "All" || entityType === "Group";

  const memberType =
    entityType === "ServicePrincipal"
      ? "ServicePrincipal"
      : entityType === "User"
      ? "User"
      : "All";

  const membersQuery = useSearchMembers({
    type: memberType,
    limit: MAX_MEMBERS,
    offset: 0,
  });
  const groupsQuery = useRbacGroups();

  const members: MemberSummary[] = needsMembers
    ? (membersQuery.data?.items as MemberSummary[] | undefined) ?? []
    : [];
  const groups: any[] = needsGroups ? ((groupsQuery.data as any[]) ?? []) : [];

  return {
    members,
    groups,
    isFetched:
      (!needsMembers || membersQuery.isFetched) &&
      (!needsGroups || groupsQuery.isFetched),
    memberTotal: membersQuery.data?.total,
  };
}

// ── Permissions tab ───────────────────────────────────────────────────────────

function PermissionsTab({
  entityType,
  namespace,
  scope,
  search,
}: {
  entityType: EntityTypeFilter;
  namespace: string;
  scope: "All" | "Global" | "Capability";
  search: string;
}) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  const { members, groups, isFetched: indexFetched, memberTotal } =
    useEntityIndex(entityType);

  const { data: capsData } = useCapabilities();
  const capsMap = useCapsMap(capsData);

  const memberQueries = useQueries({
    queries: members.map((m) => ({
      queryKey: ["rbac", "user-permissions", m.id],
      queryFn: () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["rbac", "permission", "user", m.id],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: indexFetched,
      staleTime: 30_000,
    })),
  });
  const groupQueries = useQueries({
    queries: groups.map((g: any) => ({
      queryKey: ["rbac", "group-permissions", g.id],
      queryFn: () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["rbac", "permission", "group", g.id],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: indexFetched,
      staleTime: 30_000,
    })),
  });

  const rows: PermissionRow[] = useMemo(() => {
    const out: PermissionRow[] = [];
    members.forEach((m, i) => {
      const data = (memberQueries[i]?.data as any[] | undefined) ?? [];
      data.forEach((p, j) => {
        out.push({
          rowKey: `${m.id}-${p.id ?? `${p.namespace}/${p.permission}/${j}`}`,
          grantId: p.id,
          entityType: m.type,
          entityId: m.id,
          entityLabel: m.displayName || m.email,
          entityEmail: m.email,
          namespace: p.namespace,
          permission: p.permission,
          scopeType: p.type ?? "Global",
          resource: p.resource ?? "",
          resourceLabel: p.resource ? capsMap[p.resource] ?? p.resource : "",
        });
      });
    });
    groups.forEach((g: any, i: number) => {
      const data = (groupQueries[i]?.data as any[] | undefined) ?? [];
      data.forEach((p, j) => {
        out.push({
          rowKey: `${g.id}-${p.id ?? `${p.namespace}/${p.permission}/${j}`}`,
          grantId: p.id,
          entityType: "Group",
          entityId: g.id,
          entityLabel: g.name ?? g.id,
          namespace: p.namespace,
          permission: p.permission,
          scopeType: p.type ?? "Global",
          resource: p.resource ?? "",
          resourceLabel: p.resource ? capsMap[p.resource] ?? p.resource : "",
        });
      });
    });
    return out;
  }, [members, groups, memberQueries, groupQueries, capsMap]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (namespace && r.namespace !== namespace) return false;
      if (scope === "Global" && r.scopeType !== "Global") return false;
      if (scope === "Capability" && r.scopeType !== "Capability") return false;
      if (!needle) return true;
      return (
        r.entityLabel.toLowerCase().includes(needle) ||
        r.entityEmail?.toLowerCase().includes(needle) ||
        r.namespace.toLowerCase().includes(needle) ||
        r.permission.toLowerCase().includes(needle) ||
        r.resourceLabel.toLowerCase().includes(needle)
      );
    });
  }, [rows, namespace, scope, search]);

  const allFetched =
    indexFetched &&
    memberQueries.every((q) => q.isFetched) &&
    groupQueries.every((q) => q.isFetched);

  const revokeMutation = useRevokePermission();
  const [revokeTarget, setRevokeTarget] = useState<PermissionRow | null>(null);
  const fireRevoke = useMutationToast(revokeMutation, {
    invalidateKeys: [
      ["rbac", "user-permissions"],
      ["rbac", "group-permissions"],
    ],
    successMessage: "Permission revoked",
    errorMessage: "Could not revoke permission",
    onSuccess: () => setRevokeTarget(null),
  });

  return (
    <>
      <ResultsHeader
        count={filtered.length}
        total={rows.length}
        truncated={typeof memberTotal === "number" && memberTotal > MAX_MEMBERS}
        memberTotal={memberTotal}
      />
      <Table
        isFetched={allFetched}
        empty="No permission grants match these filters."
        columns={["Entity", "Namespace", "Permission", "Scope", ""]}
        rows={filtered.map((r) => ({
          key: r.rowKey,
          cells: [
            <EntityCell
              key="ent"
              type={r.entityType}
              label={r.entityLabel}
              email={r.entityEmail}
            />,
            <span key="ns" className="text-[0.625rem] text-muted font-mono">
              {r.namespace}
            </span>,
            <span key="perm" className="text-xs font-mono text-primary">
              {r.permission}
            </span>,
            <ScopeCell
              key="scope"
              scopeType={r.scopeType}
              resourceLabel={r.resourceLabel}
            />,
            r.grantId ? (
              <IconButton
                key="revoke"
                size="sm"
                colorScheme="destructive"
                onClick={() => setRevokeTarget(r)}
                aria-label="Revoke permission"
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </IconButton>
            ) : null,
          ],
        }))}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke permission?"
        description={
          revokeTarget && (
            <p>
              Remove <strong>{revokeTarget.namespace}/{revokeTarget.permission}</strong>{" "}
              from <strong>{revokeTarget.entityLabel}</strong>?
            </p>
          )
        }
        confirmLabel="Revoke"
        confirmLoadingLabel="Revoking…"
        isPending={revokeMutation.isPending}
        onConfirm={() =>
          revokeTarget?.grantId && fireRevoke({ grantId: revokeTarget.grantId })
        }
      />
    </>
  );
}

// ── Roles tab ─────────────────────────────────────────────────────────────────

function RolesTab({
  entityType,
  scope,
  search,
}: {
  entityType: EntityTypeFilter;
  scope: "All" | "Global" | "Capability";
  search: string;
}) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  const { members, groups, isFetched: indexFetched, memberTotal } =
    useEntityIndex(entityType);
  const { data: allRolesData } = useGetRoles("");
  const allRoles: any[] = (allRolesData as any[]) ?? [];
  const rolesMap: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    allRoles.forEach((r: any) => {
      if (r.id) m[r.id] = r.name ?? r.id;
    });
    return m;
  }, [allRoles]);

  const { data: capsData } = useCapabilities();
  const capsMap = useCapsMap(capsData);

  const memberQueries = useQueries({
    queries: members.map((m) => ({
      queryKey: ["rbac", "user-roles", m.id],
      queryFn: () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["rbac", "role", "user", m.id],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: indexFetched,
      staleTime: 30_000,
    })),
  });
  const groupQueries = useQueries({
    queries: groups.map((g: any) => ({
      queryKey: ["rbac", "group-roles", g.id],
      queryFn: () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["rbac", "role", "groups", g.id],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: indexFetched,
      staleTime: 30_000,
    })),
  });

  const rows: RoleRow[] = useMemo(() => {
    const out: RoleRow[] = [];
    members.forEach((m, i) => {
      const data = (memberQueries[i]?.data as any[] | undefined) ?? [];
      data.forEach((r, j) => {
        const roleId = r.roleId ?? r.id;
        out.push({
          rowKey: `${m.id}-${r.id ?? `${roleId}/${j}`}`,
          grantId: r.id,
          entityType: m.type,
          entityId: m.id,
          entityLabel: m.displayName || m.email,
          entityEmail: m.email,
          roleId,
          roleLabel: rolesMap[roleId] ?? roleId,
          scopeType: r.type ?? "Global",
          resource: r.resource ?? "",
          resourceLabel: r.resource ? capsMap[r.resource] ?? r.resource : "",
        });
      });
    });
    groups.forEach((g: any, i: number) => {
      const data = (groupQueries[i]?.data as any[] | undefined) ?? [];
      data.forEach((r, j) => {
        const roleId = r.roleId ?? r.id;
        out.push({
          rowKey: `${g.id}-${r.id ?? `${roleId}/${j}`}`,
          grantId: r.id,
          entityType: "Group",
          entityId: g.id,
          entityLabel: g.name ?? g.id,
          roleId,
          roleLabel: rolesMap[roleId] ?? roleId,
          scopeType: r.type ?? "Global",
          resource: r.resource ?? "",
          resourceLabel: r.resource ? capsMap[r.resource] ?? r.resource : "",
        });
      });
    });
    return out;
  }, [members, groups, memberQueries, groupQueries, rolesMap, capsMap]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (scope === "Global" && r.scopeType !== "Global") return false;
      if (scope === "Capability" && r.scopeType !== "Capability") return false;
      if (!needle) return true;
      return (
        r.entityLabel.toLowerCase().includes(needle) ||
        r.entityEmail?.toLowerCase().includes(needle) ||
        r.roleLabel.toLowerCase().includes(needle) ||
        r.resourceLabel.toLowerCase().includes(needle)
      );
    });
  }, [rows, scope, search]);

  const allFetched =
    indexFetched &&
    memberQueries.every((q) => q.isFetched) &&
    groupQueries.every((q) => q.isFetched);

  const revokeMutation = useRevokeRoleGrant();
  const [revokeTarget, setRevokeTarget] = useState<RoleRow | null>(null);
  const fireRevoke = useMutationToast(revokeMutation, {
    invalidateKeys: [
      ["rbac", "user-roles"],
      ["rbac", "group-roles"],
    ],
    successMessage: "Role revoked",
    errorMessage: "Could not revoke role",
    onSuccess: () => setRevokeTarget(null),
  });

  return (
    <>
      <ResultsHeader
        count={filtered.length}
        total={rows.length}
        truncated={typeof memberTotal === "number" && memberTotal > MAX_MEMBERS}
        memberTotal={memberTotal}
      />
      <Table
        isFetched={allFetched}
        empty="No role grants match these filters."
        columns={["Entity", "Role", "Scope", ""]}
        rows={filtered.map((r) => ({
          key: r.rowKey,
          cells: [
            <EntityCell
              key="ent"
              type={r.entityType}
              label={r.entityLabel}
              email={r.entityEmail}
            />,
            <Badge key="role" variant="secondary" className="text-[0.625rem] font-mono">
              {r.roleLabel}
            </Badge>,
            <ScopeCell
              key="scope"
              scopeType={r.scopeType}
              resourceLabel={r.resourceLabel}
            />,
            r.grantId ? (
              <IconButton
                key="revoke"
                size="sm"
                colorScheme="destructive"
                onClick={() => setRevokeTarget(r)}
                aria-label="Revoke role"
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </IconButton>
            ) : null,
          ],
        }))}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke role?"
        description={
          revokeTarget && (
            <p>
              Remove <strong>{revokeTarget.roleLabel}</strong> from{" "}
              <strong>{revokeTarget.entityLabel}</strong>?
            </p>
          )
        }
        confirmLabel="Revoke"
        confirmLoadingLabel="Revoking…"
        isPending={revokeMutation.isPending}
        onConfirm={() =>
          revokeTarget?.grantId && fireRevoke({ grantId: revokeTarget.grantId })
        }
      />
    </>
  );
}

// ── Memberships tab ───────────────────────────────────────────────────────────

function MembershipsTab({
  entityType,
  search,
}: {
  entityType: "All" | "User" | "ServicePrincipal";
  search: string;
}) {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  const { data: groupsData, isFetched } = useRbacGroups();
  const groups: any[] = (groupsData as any[]) ?? [];

  // Flatten group.members[] into membership rows
  const baseRows = useMemo(() => {
    const out: Array<{
      groupId: string;
      groupLabel: string;
      membershipId: string;
      memberId: string;
    }> = [];
    groups.forEach((g: any) => {
      (g.members ?? []).forEach((m: any) => {
        out.push({
          groupId: g.id,
          groupLabel: g.name ?? g.id,
          membershipId: m.id,
          memberId: m.userId ?? m.memberId,
        });
      });
    });
    return out;
  }, [groups]);

  // Resolve display info for unique member IDs
  const uniqueMemberIds = useMemo(
    () => Array.from(new Set(baseRows.map((r) => r.memberId))),
    [baseRows],
  );

  const memberQueries = useQueries({
    queries: uniqueMemberIds.map((id) => ({
      queryKey: ["rbac", "members", id],
      queryFn: () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["rbac", "members", id],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: isFetched,
      staleTime: 30_000,
    })),
  });

  const memberInfoMap = useMemo(() => {
    const map: Record<string, MemberSummary | undefined> = {};
    uniqueMemberIds.forEach((id, i) => {
      map[id] = memberQueries[i]?.data as MemberSummary | undefined;
    });
    return map;
  }, [uniqueMemberIds, memberQueries]);

  const rows: MembershipRow[] = useMemo(
    () =>
      baseRows.map((r) => {
        const info = memberInfoMap[r.memberId];
        return {
          rowKey: `${r.groupId}-${r.membershipId}`,
          entityType: info?.type ?? "User",
          entityId: r.memberId,
          entityLabel: info?.displayName || info?.email || r.memberId,
          entityEmail: info?.email,
          groupId: r.groupId,
          groupLabel: r.groupLabel,
          membershipId: r.membershipId,
        };
      }),
    [baseRows, memberInfoMap],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (entityType !== "All" && r.entityType !== entityType) return false;
      if (!needle) return true;
      return (
        r.entityLabel.toLowerCase().includes(needle) ||
        r.entityEmail?.toLowerCase().includes(needle) ||
        r.groupLabel.toLowerCase().includes(needle)
      );
    });
  }, [rows, entityType, search]);

  const allFetched =
    isFetched && memberQueries.every((q) => q.isFetched);

  const removeMutation = useRemoveGroupMember();
  const [removeTarget, setRemoveTarget] = useState<MembershipRow | null>(null);
  const fireRemove = useMutationToast(removeMutation, {
    invalidateKeys: [["rbac", "groups"], ["rbac", "members"]],
    successMessage: "Membership removed",
    errorMessage: "Could not remove membership",
    onSuccess: () => setRemoveTarget(null),
  });

  return (
    <>
      <ResultsHeader count={filtered.length} total={rows.length} />
      <Table
        isFetched={allFetched}
        empty="No group memberships match these filters."
        columns={["Member", "Group", ""]}
        rows={filtered.map((r) => ({
          key: r.rowKey,
          cells: [
            <EntityCell
              key="ent"
              type={r.entityType}
              label={r.entityLabel}
              email={r.entityEmail}
            />,
            <span key="grp" className="text-xs font-mono text-primary">
              {r.groupLabel}
            </span>,
            <IconButton
              key="revoke"
              size="sm"
              colorScheme="destructive"
              onClick={() => setRemoveTarget(r)}
              aria-label="Remove from group"
            >
              <Trash2 size={13} strokeWidth={1.75} />
            </IconButton>,
          ],
        }))}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove membership?"
        description={
          removeTarget && (
            <p>
              Remove <strong>{removeTarget.entityLabel}</strong> from{" "}
              <strong>{removeTarget.groupLabel}</strong>?
            </p>
          )
        }
        confirmLabel="Remove"
        confirmLoadingLabel="Removing…"
        isPending={removeMutation.isPending}
        onConfirm={() =>
          removeTarget &&
          fireRemove({
            groupId: removeTarget.groupId,
            memberId: removeTarget.membershipId,
          })
        }
      />
    </>
  );
}

// ── Grant dialog ──────────────────────────────────────────────────────────────

function GrantDialog({
  tab,
  open,
  onOpenChange,
}: {
  tab: AssignmentTab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tab === "permissions" && "Grant permission to entities"}
            {tab === "roles" && "Grant role to entities"}
            {tab === "memberships" && "Add members to a group"}
          </DialogTitle>
        </DialogHeader>
        {tab === "permissions" && (
          <BulkPermissionForm onDone={() => onOpenChange(false)} />
        )}
        {tab === "roles" && <BulkRoleForm onDone={() => onOpenChange(false)} />}
        {tab === "memberships" && (
          <BulkMembershipForm onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BulkPermissionForm({ onDone }: { onDone: () => void }) {
  const [targets, setTargets] = useState<MemberSummary[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groupAddInput, setGroupAddInput] = useState("");
  const [permissions, setPermissions] = useState<PermissionSelection[]>([]);
  const [scope, setScope] = useState<ScopeValue>({ type: "Global", resource: "" });

  const mutation = useGrantPermissionsBulk();
  const fire = useMutationToast(mutation, {
    invalidateKeys: [
      ["rbac", "user-permissions"],
      ["rbac", "group-permissions"],
    ],
    successMessage: (data: any) => {
      const ok = data?.created?.length ?? 0;
      return `Granted ${ok} permission${ok === 1 ? "" : "s"}`;
    },
    errorMessage: "Could not grant permissions",
    onSuccess: () => onDone(),
  });

  const totalTargets = targets.length + groupIds.length;
  const totalGrants = totalTargets * permissions.length;
  const canSubmit =
    permissions.length > 0 &&
    (scope.type === "Global" || !!scope.resource) &&
    totalTargets > 0 &&
    !mutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const grants: any[] = [];
    permissions.forEach((p) => {
      targets.forEach((t) => {
        grants.push({
          assignedEntityType: "User",
          assignedEntityId: t.id,
          namespace: p.namespace,
          permission: p.permission,
          type: scope.type,
          resource: scope.type === "Capability" ? scope.resource : "",
        });
      });
      groupIds.forEach((gid) => {
        grants.push({
          assignedEntityType: "Group",
          assignedEntityId: gid,
          namespace: p.namespace,
          permission: p.permission,
          type: scope.type,
          resource: scope.type === "Capability" ? scope.resource : "",
        });
      });
    });
    fire({ grants });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <TargetsPicker
        targets={targets}
        setTargets={setTargets}
        groupIds={groupIds}
        setGroupIds={setGroupIds}
        groupAddInput={groupAddInput}
        setGroupAddInput={setGroupAddInput}
      />
      <div>
        <SectionLabel className="block mb-1.5">Permissions</SectionLabel>
        <PermissionPicker value={permissions} onChange={setPermissions} />
      </div>
      <div>
        <SectionLabel className="block mb-1.5">Scope</SectionLabel>
        <ScopePicker value={scope} onChange={setScope} />
      </div>
      <FormFooter
        onCancel={onDone}
        canSubmit={canSubmit}
        isPending={mutation.isPending}
        submitLabel={
          totalGrants === 0
            ? "Grant"
            : `Grant ${totalGrants} (${permissions.length}×${totalTargets})`
        }
        loadingLabel="Granting…"
      />
    </form>
  );
}

function BulkRoleForm({ onDone }: { onDone: () => void }) {
  const [targets, setTargets] = useState<MemberSummary[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groupAddInput, setGroupAddInput] = useState("");
  const [roleId, setRoleId] = useState("");
  const [scope, setScope] = useState<ScopeValue>({ type: "Global", resource: "" });

  const mutation = useGrantRolesBulk();
  const fire = useMutationToast(mutation, {
    invalidateKeys: [
      ["rbac", "user-roles"],
      ["rbac", "group-roles"],
    ],
    successMessage: (data: any) => {
      const ok = data?.created?.length ?? 0;
      return `Granted ${ok} role${ok === 1 ? "" : "s"}`;
    },
    errorMessage: "Could not grant roles",
    onSuccess: () => onDone(),
  });

  const canSubmit =
    !!roleId &&
    (scope.type === "Global" || !!scope.resource) &&
    (targets.length > 0 || groupIds.length > 0) &&
    !mutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const grants = [
      ...targets.map((t) => ({
        roleId,
        assignedEntityType: "User",
        assignedEntityId: t.id,
        type: scope.type,
        resource: scope.type === "Capability" ? scope.resource : "",
      })),
      ...groupIds.map((gid) => ({
        roleId,
        assignedEntityType: "Group",
        assignedEntityId: gid,
        type: scope.type,
        resource: scope.type === "Capability" ? scope.resource : "",
      })),
    ];
    fire({ grants });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <TargetsPicker
        targets={targets}
        setTargets={setTargets}
        groupIds={groupIds}
        setGroupIds={setGroupIds}
        groupAddInput={groupAddInput}
        setGroupAddInput={setGroupAddInput}
      />
      <div>
        <SectionLabel className="block mb-1.5">Role</SectionLabel>
        <RolePicker value={roleId} onChange={setRoleId} />
      </div>
      <div>
        <SectionLabel className="block mb-1.5">Scope</SectionLabel>
        <ScopePicker value={scope} onChange={setScope} />
      </div>
      <FormFooter
        onCancel={onDone}
        canSubmit={canSubmit}
        isPending={mutation.isPending}
        submitLabel={`Grant to ${targets.length + groupIds.length}`}
        loadingLabel="Granting…"
      />
    </form>
  );
}

function BulkMembershipForm({ onDone }: { onDone: () => void }) {
  const [targets, setTargets] = useState<MemberSummary[]>([]);
  const [groupId, setGroupId] = useState("");
  const addMutation = useAddGroupMember();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const canSubmit = !!groupId && targets.length > 0 && !pending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    const results = await Promise.allSettled(
      targets.map((t) =>
        addMutation.mutateAsync({ groupId, memberId: t.id }),
      ),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    queryClient.invalidateQueries({ queryKey: ["rbac", "groups"] });
    if (failed === 0) {
      toast.success(`Added ${ok} member${ok === 1 ? "" : "s"}`);
    } else if (ok === 0) {
      toast.error(`Could not add any members`);
    } else {
      toast.error(`Added ${ok}, ${failed} failed`);
    }
    setPending(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div>
        <SectionLabel className="block mb-1.5">Group</SectionLabel>
        <GroupPicker value={groupId} onChange={setGroupId} />
      </div>
      <div>
        <SectionLabel className="block mb-1.5">
          Members ({targets.length})
        </SectionLabel>
        <MemberAccumulator targets={targets} setTargets={setTargets} />
      </div>
      <FormFooter
        onCancel={onDone}
        canSubmit={canSubmit}
        isPending={pending}
        submitLabel={`Add ${targets.length}`}
        loadingLabel="Adding…"
      />
    </form>
  );
}

function TargetsPicker({
  targets,
  setTargets,
  groupIds,
  setGroupIds,
  groupAddInput,
  setGroupAddInput,
}: {
  targets: MemberSummary[];
  setTargets: (next: MemberSummary[]) => void;
  groupIds: string[];
  setGroupIds: (next: string[]) => void;
  groupAddInput: string;
  setGroupAddInput: (next: string) => void;
}) {
  const totalTargets = targets.length + groupIds.length;
  return (
    <div className="space-y-3">
      <div>
        <SectionLabel className="block mb-1.5">
          Targets ({totalTargets})
        </SectionLabel>
        <MemberAccumulator targets={targets} setTargets={setTargets} />
      </div>
      <div>
        <SectionLabel className="block mb-1.5">Also grant to group</SectionLabel>
        <div className="flex gap-1.5">
          <GroupPicker
            value={groupAddInput}
            onChange={setGroupAddInput}
            excludeIds={groupIds}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!groupAddInput}
            onClick={() => {
              if (!groupAddInput) return;
              setGroupIds([...groupIds, groupAddInput]);
              setGroupAddInput("");
            }}
            className="h-8 px-2 text-xs shrink-0"
          >
            Add
          </Button>
        </div>
        {groupIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {groupIds.map((gid) => (
              <Badge
                key={gid}
                variant="outline"
                className="text-[0.625rem] font-mono gap-1"
              >
                {gid}
                <button
                  type="button"
                  onClick={() => setGroupIds(groupIds.filter((x) => x !== gid))}
                  className="text-muted hover:text-destructive cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Remove group"
                >
                  <X size={10} strokeWidth={1.75} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberAccumulator({
  targets,
  setTargets,
}: {
  targets: MemberSummary[];
  setTargets: (next: MemberSummary[]) => void;
}) {
  const selectedIds = new Set(targets.map((t) => t.id));
  return (
    <div className="space-y-1.5">
      <EntityPicker
        onSelect={(m) => {
          if (selectedIds.has(m.id)) return;
          setTargets([...targets, m]);
        }}
        placeholder="Search users or service accounts…"
      />
      {targets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {targets.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1.5 px-2 py-1 border border-card rounded-[5px] bg-surface text-xs"
            >
              <span className="font-mono text-primary truncate max-w-[160px]">
                {t.displayName || t.email}
              </span>
              <EntityTypeBadge kind={t.type} />
              <button
                type="button"
                onClick={() =>
                  setTargets(targets.filter((x) => x.id !== t.id))
                }
                className="text-muted hover:text-destructive cursor-pointer border-0 bg-transparent p-0"
                aria-label={`Remove ${t.displayName || t.email}`}
              >
                <X size={11} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormFooter({
  onCancel,
  canSubmit,
  isPending,
  submitLabel,
  loadingLabel,
}: {
  onCancel: () => void;
  canSubmit: boolean;
  isPending: boolean;
  submitLabel: string;
  loadingLabel: string;
}) {
  return (
    <div className="flex gap-2 justify-end pt-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
        Cancel
      </Button>
      <Button type="submit" variant="action" disabled={!canSubmit}>
        {isPending ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}

// ── Shared pieces ─────────────────────────────────────────────────────────────

function useCapsMap(capsData: unknown): Record<string, string> {
  return useMemo(() => {
    const caps = (capsData as any[]) ?? [];
    const m: Record<string, string> = {};
    caps.forEach((c: any) => {
      if (c.id) m[c.id] = c.name ?? c.id;
    });
    return m;
  }, [capsData]);
}

function ResultsHeader({
  count,
  total,
  truncated,
  memberTotal,
}: {
  count: number;
  total: number;
  truncated?: boolean;
  memberTotal?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
      <p className="text-[0.625rem] text-muted font-mono">
        Showing {count} of {total}
      </p>
      {truncated && typeof memberTotal === "number" && (
        <p className="text-[0.625rem] text-warning font-mono">
          Capped at {MAX_MEMBERS} of {memberTotal} members — narrow the filter to
          see more.
        </p>
      )}
    </div>
  );
}

function EntityCell({
  type,
  label,
  email,
}: {
  type: "User" | "ServicePrincipal" | "Group";
  label: string;
  email?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-primary truncate">{label}</span>
        {email && email !== label && (
          <span className="text-[0.625rem] text-muted font-mono truncate">
            {email}
          </span>
        )}
      </div>
      <EntityTypeBadge kind={type} />
    </div>
  );
}

function ScopeCell({
  scopeType,
  resourceLabel,
}: {
  scopeType: string;
  resourceLabel: string;
}) {
  if (!resourceLabel || scopeType === "Global") {
    return (
      <span className="text-[0.625rem] text-muted font-mono">Global</span>
    );
  }
  return (
    <span className="text-[0.625rem] text-muted font-mono truncate">
      {scopeType}: {resourceLabel}
    </span>
  );
}

interface TableRow {
  key: string;
  cells: React.ReactNode[];
}

const TABLE_PAGE_SIZE = 25;

function Table({
  columns,
  rows,
  isFetched,
  empty,
  pageSize = TABLE_PAGE_SIZE,
}: {
  columns: string[];
  rows: TableRow[];
  isFetched: boolean;
  empty: string;
  pageSize?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  if (!isFetched) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-[5px]" />
        ))}
      </div>
    );
  }
  if (total === 0) {
    return (
      <div className="border border-card rounded-[8px] bg-surface p-8 flex flex-col items-center text-center gap-2">
        <Search size={24} strokeWidth={1.5} className="text-muted" />
        <EmptyState>{empty}</EmptyState>
      </div>
    );
  }
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  return (
    <>
      <div className="border border-card rounded-[8px] overflow-hidden">
        <div
          className="grid items-center gap-3 px-3 py-2 bg-surface-muted border-b border-card text-[0.625rem] uppercase font-mono text-muted"
          style={{
            gridTemplateColumns: columns
              .map((_, i) => (i === columns.length - 1 ? "auto" : "1fr"))
              .join(" "),
          }}
        >
          {columns.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className="divide-y divide-divider">
          {pageRows.map((row) => (
            <div
              key={row.key}
              className="grid items-center gap-3 px-3 py-2 bg-surface"
              style={{
                gridTemplateColumns: columns
                  .map((_, i) => (i === columns.length - 1 ? "auto" : "1fr"))
                  .join(" "),
              }}
            >
              {row.cells.map((c, i) => (
                <React.Fragment key={i}>{c}</React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
      {total > pageSize && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageSize={pageSize}
          total={total}
          onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      )}
    </>
  );
}
