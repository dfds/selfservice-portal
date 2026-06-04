import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  useMember,
  useMemberGroups,
  useUserPermissions,
  useUserRbacRoles,
  useGrantPermissionsBulk,
  useRevokePermission,
  useGrantRoleGlobal,
  useRevokeRoleGrant,
  useAddGroupMember,
  useRemoveGroupMember,
  useRbacGroups,
  useGetRoles,
  type MemberSummary,
} from "@/state/remote/queries/rbac";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { useMutationToast } from "@/hooks/useMutationToast";
import {
  EntityTypeBadge,
  GrantsTable,
  GroupPicker,
  PermissionPicker,
  RolePicker,
  ScopePicker,
  type GrantRow,
  type PermissionSelection,
  type ScopeValue,
} from "@/components/rbac";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface EntityInspectorProps {
  memberId: string;
  initialMember?: MemberSummary;
}

export function EntityInspector({
  memberId,
  initialMember,
}: EntityInspectorProps) {
  const memberQuery = useMember(memberId);
  const member: MemberSummary | undefined =
    (memberQuery.data as MemberSummary | undefined) ?? initialMember;

  return (
    <div className="flex flex-col gap-4">
      <InspectorHeader member={member} loading={!memberQuery.isFetched && !initialMember} />
      <PermissionsCard memberId={memberId} />
      <RolesCard memberId={memberId} />
      <GroupMembershipsCard memberId={memberId} />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function InspectorHeader({
  member,
  loading,
}: {
  member?: MemberSummary;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    );
  }
  if (!member) {
    return (
      <div className="text-sm text-muted font-mono">
        Member not found.
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-primary truncate">
          {member.displayName || member.email}
        </h2>
        <p className="text-xs text-muted font-mono truncate">{member.email}</p>
      </div>
      <EntityTypeBadge kind={member.type} />
    </div>
  );
}

// ── Permissions ───────────────────────────────────────────────────────────────

function PermissionsCard({ memberId }: { memberId: string }) {
  const { data, isFetched } = useUserPermissions(memberId);
  const { data: capsData } = useCapabilities();
  const items: any[] = (data as any[]) ?? [];
  const caps: any[] = (capsData as any[]) ?? [];
  const capsMap: Record<string, string> = caps.reduce((acc, c: any) => {
    if (c.id) acc[c.id] = c.name;
    return acc;
  }, {});

  const grantMutation = useGrantPermissionsBulk();
  const revokeMutation = useRevokePermission();
  const [showGrant, setShowGrant] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<GrantRow | null>(null);

  const fireGrant = useMutationToast(grantMutation, {
    invalidateKeys: [["rbac", "user-permissions", memberId]],
    successMessage: (data: any) => {
      const n = data?.created?.length ?? 0;
      return `Granted ${n} permission${n === 1 ? "" : "s"}`;
    },
    errorMessage: "Could not grant permissions",
    onSuccess: () => setShowGrant(false),
  });

  const fireRevoke = useMutationToast(revokeMutation, {
    invalidateKeys: [["rbac", "user-permissions", memberId]],
    successMessage: "Permission revoked",
    errorMessage: "Could not revoke permission",
    onSuccess: () => setRevokeTarget(null),
  });

  const rows: GrantRow[] = items.map((p: any) => ({
    id: p.id ?? `${p.namespace}/${p.permission}/${p.resource ?? ""}`,
    kind: "Permission",
    label: p.permission,
    namespace: p.namespace,
    scopeType: p.type,
    resource: p.resource,
    resourceName: p.resource ? capsMap[p.resource] : undefined,
    canRevoke: !!p.id,
  }));

  return (
    <Card
      title="Permissions"
      count={rows.length}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrant(true)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Plus size={12} strokeWidth={1.75} /> Grant
        </Button>
      }
    >
      <GrantsTable
        rows={rows}
        isFetched={isFetched}
        onRevoke={(row) => setRevokeTarget(row)}
        emptyMessage="No direct permissions."
      />

      <GrantPermissionDialog
        open={showGrant}
        onOpenChange={setShowGrant}
        memberId={memberId}
        isPending={grantMutation.isPending}
        onSubmit={(payload) => fireGrant(payload)}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke permission?"
        description={
          revokeTarget && (
            <p>
              Remove <strong>{revokeTarget.namespace}/{revokeTarget.label}</strong>{" "}
              from this member?
            </p>
          )
        }
        confirmLabel="Revoke"
        confirmLoadingLabel="Revoking…"
        isPending={revokeMutation.isPending}
        onConfirm={() => revokeTarget && fireRevoke({ grantId: revokeTarget.id })}
      />
    </Card>
  );
}

function GrantPermissionDialog({
  open,
  onOpenChange,
  memberId,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  isPending: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [permissions, setPermissions] = useState<PermissionSelection[]>([]);
  const [scope, setScope] = useState<ScopeValue>({ type: "Global", resource: "" });

  React.useEffect(() => {
    if (!open) {
      setPermissions([]);
      setScope({ type: "Global", resource: "" });
    }
  }, [open]);

  const canSubmit =
    permissions.length > 0 &&
    (scope.type === "Global" || !!scope.resource) &&
    !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const grants = permissions.map((p) => ({
      assignedEntityType: "User",
      assignedEntityId: memberId,
      namespace: p.namespace,
      permission: p.permission,
      type: scope.type,
      resource: scope.type === "Capability" ? scope.resource : "",
    }));
    onSubmit({ grants });
  }

  const submitLabel =
    permissions.length === 0
      ? "Grant"
      : permissions.length === 1
      ? "Grant 1 permission"
      : `Grant ${permissions.length} permissions`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant permissions</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <SectionLabel className="block mb-1.5">Permissions</SectionLabel>
            <PermissionPicker value={permissions} onChange={setPermissions} />
          </div>
          <div>
            <SectionLabel className="block mb-1.5">Scope</SectionLabel>
            <ScopePicker value={scope} onChange={setScope} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="action" disabled={!canSubmit}>
              {isPending ? "Granting…" : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Roles ─────────────────────────────────────────────────────────────────────

function RolesCard({
  memberId,
}: {
  memberId: string;
}) {
  const { data, isFetched } = useUserRbacRoles(memberId);
  const { data: allRolesData } = useGetRoles("");
  const { data: capsData } = useCapabilities();

  const items: any[] = (data as any[]) ?? [];
  const allRoles: any[] = (allRolesData as any[]) ?? [];
  const caps: any[] = (capsData as any[]) ?? [];

  const rolesMap: Record<string, string> = allRoles.reduce((acc, r: any) => {
    if (r.id) acc[r.id] = r.name ?? r.id;
    return acc;
  }, {});
  const capsMap: Record<string, string> = caps.reduce((acc, c: any) => {
    if (c.id) acc[c.id] = c.name;
    return acc;
  }, {});

  const grantMutation = useGrantRoleGlobal();
  const revokeMutation = useRevokeRoleGrant();
  const [showGrant, setShowGrant] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<GrantRow | null>(null);

  const fireGrant = useMutationToast(grantMutation, {
    invalidateKeys: [["rbac", "user-roles", memberId]],
    successMessage: "Role granted",
    errorMessage: "Could not grant role",
    onSuccess: () => setShowGrant(false),
  });

  const fireRevoke = useMutationToast(revokeMutation, {
    invalidateKeys: [["rbac", "user-roles", memberId]],
    successMessage: "Role revoked",
    errorMessage: "Could not revoke role",
    onSuccess: () => setRevokeTarget(null),
  });

  const rows: GrantRow[] = items.map((r: any) => {
    const roleId = r.roleId ?? r.id;
    return {
      id: r.id ?? roleId,
      kind: "Role",
      label: rolesMap[roleId] ?? roleId,
      scopeType: r.type,
      resource: r.resource,
      resourceName: r.resource ? capsMap[r.resource] : undefined,
      canRevoke: !!r.id,
    };
  });

  return (
    <Card
      title="Roles"
      count={rows.length}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrant(true)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Plus size={12} strokeWidth={1.75} /> Grant
        </Button>
      }
    >
      <GrantsTable
        rows={rows}
        isFetched={isFetched}
        onRevoke={(row) => setRevokeTarget(row)}
        emptyMessage="No roles assigned."
      />

      <GrantRoleDialog
        open={showGrant}
        onOpenChange={setShowGrant}
        memberId={memberId}
        isPending={grantMutation.isPending}
        onSubmit={(payload) => fireGrant(payload)}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke role?"
        description={
          revokeTarget && <p>Remove <strong>{revokeTarget.label}</strong> from this member?</p>
        }
        confirmLabel="Revoke"
        confirmLoadingLabel="Revoking…"
        isPending={revokeMutation.isPending}
        onConfirm={() => revokeTarget && fireRevoke({ grantId: revokeTarget.id })}
      />
    </Card>
  );
}

function GrantRoleDialog({
  open,
  onOpenChange,
  memberId,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  isPending: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [roleId, setRoleId] = useState("");
  const [scope, setScope] = useState<ScopeValue>({ type: "Global", resource: "" });

  React.useEffect(() => {
    if (!open) {
      setRoleId("");
      setScope({ type: "Global", resource: "" });
    }
  }, [open]);

  const canSubmit =
    !!roleId && (scope.type === "Global" || !!scope.resource) && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      roleId,
      assignedEntityType: "User",
      assignedEntityId: memberId,
      type: scope.type,
      resource: scope.type === "Capability" ? scope.resource : "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <SectionLabel className="block mb-1.5">Role</SectionLabel>
            <RolePicker value={roleId} onChange={setRoleId} />
          </div>
          <div>
            <SectionLabel className="block mb-1.5">Scope</SectionLabel>
            <ScopePicker value={scope} onChange={setScope} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="action" disabled={!canSubmit}>
              {isPending ? "Granting…" : "Grant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Group memberships ─────────────────────────────────────────────────────────

function GroupMembershipsCard({ memberId }: { memberId: string }) {
  const { data, isFetched } = useMemberGroups(memberId);
  const { data: allGroupsData } = useRbacGroups();
  const groups: any[] = (data as any[]) ?? [];
  const allGroups: any[] = (allGroupsData as any[]) ?? [];
  const allGroupsMap: Record<string, string> = allGroups.reduce(
    (acc, g: any) => {
      if (g.id) acc[g.id] = g.name ?? g.id;
      return acc;
    },
    {},
  );

  const addMutation = useAddGroupMember();
  const removeMutation = useRemoveGroupMember();
  const [showAdd, setShowAdd] = useState(false);
  const [addGroupId, setAddGroupId] = useState("");
  const [removeTarget, setRemoveTarget] = useState<{ groupId: string; name: string } | null>(null);

  const fireAdd = useMutationToast(addMutation, {
    invalidateKeys: [
      ["rbac", "members", memberId, "groups"],
      ["rbac", "groups"],
    ],
    successMessage: "Added to group",
    errorMessage: "Could not add to group",
    onSuccess: () => {
      setShowAdd(false);
      setAddGroupId("");
    },
  });

  const fireRemove = useMutationToast(removeMutation, {
    invalidateKeys: [
      ["rbac", "members", memberId, "groups"],
      ["rbac", "groups"],
    ],
    successMessage: "Removed from group",
    errorMessage: "Could not remove from group",
    onSuccess: () => setRemoveTarget(null),
  });

  const currentGroupIds = groups
    .map((g: any) => g.id)
    .filter((x: any): x is string => typeof x === "string");

  return (
    <Card
      title="Group memberships"
      count={groups.length}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdd(true)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Plus size={12} strokeWidth={1.75} /> Add to group
        </Button>
      }
    >
      {!isFetched ? (
        <div className="space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-[4px]" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState>Not a member of any groups.</EmptyState>
      ) : (
        <div className="flex flex-col divide-y divide-divider rounded-[8px] border border-card overflow-hidden">
          {groups.map((g: any) => {
            const name = g.name ?? allGroupsMap[g.id] ?? g.id;
            return (
              <div
                key={g.id}
                className="flex items-center gap-3 px-3 py-2 bg-surface"
              >
                <span className="text-xs font-mono text-primary flex-1 truncate">
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => setRemoveTarget({ groupId: g.id, name })}
                  className="text-[0.625rem] text-muted hover:text-destructive font-mono transition-colors cursor-pointer border-0 bg-transparent"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to group</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!addGroupId) return;
              fireAdd({ groupId: addGroupId, memberId });
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <SectionLabel className="block mb-1.5">Group</SectionLabel>
              <GroupPicker
                value={addGroupId}
                onChange={setAddGroupId}
                excludeIds={currentGroupIds}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdd(false)}
                disabled={addMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="action"
                disabled={!addGroupId || addMutation.isPending}
              >
                {addMutation.isPending ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove from group?"
        description={
          removeTarget && (
            <p>
              Remove this member from <strong>{removeTarget.name}</strong>?
            </p>
          )
        }
        confirmLabel="Remove"
        confirmLoadingLabel="Removing…"
        isPending={removeMutation.isPending}
        onConfirm={() =>
          removeTarget && fireRemove({ groupId: removeTarget.groupId, memberId })
        }
      />
    </Card>
  );
}

// ── Section card primitive ────────────────────────────────────────────────────

function Card({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-card rounded-[8px] p-4 bg-surface">
      <header className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <SectionLabel>{title}</SectionLabel>
          {typeof count === "number" && (
            <span className="text-[0.625rem] text-muted font-mono">
              ({count})
            </span>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
