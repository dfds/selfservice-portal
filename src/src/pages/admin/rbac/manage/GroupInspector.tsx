import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  useRbacGroups,
  useGroupPermissions,
  useGroupRoles,
  useGetRoles,
  useGrantPermissionsBulk,
  useRevokePermission,
  useGrantRoleGlobal,
  useRevokeRoleGrant,
  useAddGroupMember,
  useRemoveGroupMember,
  useMember,
  useDeleteRbacGroup,
  type MemberSummary,
} from "@/state/remote/queries/rbac";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { useMutationToast } from "@/hooks/useMutationToast";
import {
  EntityPicker,
  EntityTypeBadge,
  GrantsTable,
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

interface GroupInspectorProps {
  groupId: string;
  onDeleted?: () => void;
}

export function GroupInspector({ groupId, onDeleted }: GroupInspectorProps) {
  const { data: groupsData, isFetched } = useRbacGroups();
  const groups: any[] = (groupsData as any[]) ?? [];
  const group = groups.find((g: any) => g.id === groupId);

  const deleteMutation = useDeleteRbacGroup();
  const [showDelete, setShowDelete] = useState(false);
  const fireDelete = useMutationToast(deleteMutation, {
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Group deleted",
    errorMessage: "Could not delete group",
    onSuccess: () => {
      setShowDelete(false);
      onDeleted?.();
    },
  });

  if (!isFetched) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!group) {
    return <div className="text-sm text-muted font-mono">Group not found.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-primary truncate">
            {group.name ?? group.id}
          </h2>
          <p className="text-xs text-muted font-mono truncate">{group.id}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDelete(true)}
          className="h-7 px-2 text-xs text-destructive border-card"
        >
          Delete group
        </Button>
      </header>

      <MembersCard groupId={groupId} members={group.members ?? []} />
      <GroupGrantsCard groupId={groupId} groupName={group.name ?? group.id} />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete group?"
        description={
          <p>
            Permanently delete <strong>{group.name ?? group.id}</strong>? This
            cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting…"
        isPending={deleteMutation.isPending}
        onConfirm={() => fireDelete({ groupId })}
      />
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────────────────────

function MembersCard({
  groupId,
  members,
}: {
  groupId: string;
  members: any[];
}) {
  const addMutation = useAddGroupMember();
  const removeMutation = useRemoveGroupMember();

  const [showAdd, setShowAdd] = useState(false);
  const [pendingMember, setPendingMember] = useState<MemberSummary | null>(
    null,
  );
  const [removeTarget, setRemoveTarget] = useState<{
    membershipId: string;
    memberId: string;
    label: string;
  } | null>(null);

  const fireAdd = useMutationToast(addMutation, {
    invalidateKeys: [
      ["rbac", "groups"],
      ["rbac", "members", pendingMember?.id, "groups"],
    ],
    successMessage: "Member added",
    errorMessage: "Could not add member",
    onSuccess: () => {
      setShowAdd(false);
      setPendingMember(null);
    },
  });

  const fireRemove = useMutationToast(removeMutation, {
    invalidateKeys: [
      ["rbac", "groups"],
      ["rbac", "members", removeTarget?.memberId, "groups"],
    ],
    successMessage: "Member removed",
    errorMessage: "Could not remove member",
    onSuccess: () => setRemoveTarget(null),
  });

  const currentMemberIds = members
    .map((m: any) => m.userId ?? m.memberId)
    .filter((x: any): x is string => typeof x === "string");

  return (
    <section className="border border-card rounded-[8px] p-4 bg-surface">
      <header className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <SectionLabel>Members</SectionLabel>
          <span className="text-[0.625rem] text-muted font-mono">
            ({members.length})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdd(true)}
          className="h-7 px-2 text-xs gap-1"
        >
          <Plus size={12} strokeWidth={1.75} /> Add member
        </Button>
      </header>

      {members.length === 0 ? (
        <EmptyState>No members in this group.</EmptyState>
      ) : (
        <div className="flex flex-col divide-y divide-divider rounded-[8px] border border-card overflow-hidden">
          {members.map((m: any) => (
            <MemberRow
              key={m.id ?? m.userId}
              membershipId={m.id}
              memberId={m.userId ?? m.memberId}
              onRemove={(label) =>
                setRemoveTarget({
                  membershipId: m.id,
                  memberId: m.userId ?? m.memberId,
                  label,
                })
              }
            />
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member to group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <SectionLabel className="block mb-1.5">Member</SectionLabel>
              {pendingMember ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-card rounded-[5px] bg-surface">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm text-primary font-medium truncate">
                      {pendingMember.displayName || pendingMember.email}
                    </span>
                    <span className="text-xs text-muted font-mono truncate">
                      {pendingMember.email}
                    </span>
                  </div>
                  <EntityTypeBadge kind={pendingMember.type} />
                  <button
                    type="button"
                    onClick={() => setPendingMember(null)}
                    className="text-[0.625rem] text-muted hover:text-action font-mono cursor-pointer border-0 bg-transparent"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <EntityPicker
                  onSelect={(m) => {
                    if (currentMemberIds.includes(m.id)) return;
                    setPendingMember(m);
                  }}
                  placeholder="Search for a user or service account…"
                  autoFocus
                />
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAdd(false);
                  setPendingMember(null);
                }}
                disabled={addMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="action"
                disabled={!pendingMember || addMutation.isPending}
                onClick={() => {
                  if (!pendingMember) return;
                  fireAdd({ groupId, memberId: pendingMember.id });
                }}
              >
                {addMutation.isPending ? "Adding…" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove member?"
        description={
          removeTarget && (
            <p>
              Remove <strong>{removeTarget.label}</strong> from this group?
            </p>
          )
        }
        confirmLabel="Remove"
        confirmLoadingLabel="Removing…"
        isPending={removeMutation.isPending}
        onConfirm={() =>
          removeTarget &&
          fireRemove({ groupId, memberId: removeTarget.memberId })
        }
      />
    </section>
  );
}

function MemberRow({
  membershipId,
  memberId,
  onRemove,
}: {
  membershipId: string;
  memberId: string;
  onRemove: (label: string) => void;
}) {
  const { data } = useMember(memberId);
  const member = data as MemberSummary | undefined;
  const label = member?.displayName || member?.email || memberId;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-surface">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium text-primary truncate">
          {label}
        </span>
        {member?.email && member.email !== label && (
          <span className="text-[0.625rem] text-muted font-mono truncate">
            {member.email}
          </span>
        )}
      </div>
      {member?.type && <EntityTypeBadge kind={member.type} />}
      <button
        type="button"
        onClick={() => onRemove(label)}
        className="text-[0.625rem] text-muted hover:text-destructive font-mono transition-colors cursor-pointer border-0 bg-transparent"
      >
        Remove
      </button>
    </div>
  );
}

// ── Grants on this group ──────────────────────────────────────────────────────

function GroupGrantsCard({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const { data: permsData, isFetched: permsFetched } =
    useGroupPermissions(groupId);
  const { data: rolesData, isFetched: rolesFetched } = useGroupRoles(groupId);
  const { data: allRolesData } = useGetRoles("");
  const { data: capsData } = useCapabilities();

  const perms: any[] = (permsData as any[]) ?? [];
  const roleItems: any[] = (rolesData as any[]) ?? [];
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

  const grantPermMutation = useGrantPermissionsBulk();
  const revokePermMutation = useRevokePermission();
  const grantRoleMutation = useGrantRoleGlobal();
  const revokeRoleMutation = useRevokeRoleGrant();

  const [showGrantPerm, setShowGrantPerm] = useState(false);
  const [showGrantRole, setShowGrantRole] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<GrantRow | null>(null);

  const firePermGrant = useMutationToast(grantPermMutation, {
    invalidateKeys: [["rbac", "group-permissions", groupId]],
    successMessage: (data: any) => {
      const n = data?.created?.length ?? 0;
      return `Granted ${n} permission${n === 1 ? "" : "s"}`;
    },
    errorMessage: "Could not grant permissions",
    onSuccess: () => setShowGrantPerm(false),
  });
  const firePermRevoke = useMutationToast(revokePermMutation, {
    invalidateKeys: [["rbac", "group-permissions", groupId]],
    successMessage: "Permission revoked",
    errorMessage: "Could not revoke permission",
    onSuccess: () => setRevokeTarget(null),
  });
  const fireRoleGrant = useMutationToast(grantRoleMutation, {
    invalidateKeys: [["rbac", "group-roles", groupId]],
    successMessage: "Role granted",
    errorMessage: "Could not grant role",
    onSuccess: () => setShowGrantRole(false),
  });
  const fireRoleRevoke = useMutationToast(revokeRoleMutation, {
    invalidateKeys: [["rbac", "group-roles", groupId]],
    successMessage: "Role revoked",
    errorMessage: "Could not revoke role",
    onSuccess: () => setRevokeTarget(null),
  });

  const rows: GrantRow[] = [
    ...perms.map((p: any) => ({
      id: p.id ?? `${p.namespace}/${p.permission}/${p.resource ?? ""}`,
      kind: "Permission" as const,
      label: p.permission,
      namespace: p.namespace,
      scopeType: p.type,
      resource: p.resource,
      resourceName: p.resource ? capsMap[p.resource] : undefined,
      canRevoke: !!p.id,
    })),
    ...roleItems.map((r: any) => {
      const rId = r.roleId ?? r.id;
      return {
        id: r.id ?? rId,
        kind: "Role" as const,
        label: rolesMap[rId] ?? rId,
        scopeType: r.type,
        resource: r.resource,
        resourceName: r.resource ? capsMap[r.resource] : undefined,
        canRevoke: !!r.id,
      };
    }),
  ];

  function handleRevoke(row: GrantRow) {
    setRevokeTarget(row);
  }

  function confirmRevoke() {
    if (!revokeTarget) return;
    if (revokeTarget.kind === "Permission") {
      firePermRevoke({ grantId: revokeTarget.id });
    } else {
      fireRoleRevoke({ grantId: revokeTarget.id });
    }
  }

  return (
    <section className="border border-card rounded-[8px] p-4 bg-surface">
      <header className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <SectionLabel>Grants on this group</SectionLabel>
          <span className="text-[0.625rem] text-muted font-mono">
            ({rows.length})
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrantPerm(true)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus size={12} strokeWidth={1.75} /> Permission
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrantRole(true)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus size={12} strokeWidth={1.75} /> Role
          </Button>
        </div>
      </header>

      <GrantsTable
        rows={rows}
        isFetched={permsFetched && rolesFetched}
        onRevoke={handleRevoke}
        emptyMessage="No permissions or roles granted to this group."
      />

      <GroupGrantPermissionDialog
        open={showGrantPerm}
        onOpenChange={setShowGrantPerm}
        groupId={groupId}
        isPending={grantPermMutation.isPending}
        onSubmit={(payload) => firePermGrant(payload)}
      />
      <GroupGrantRoleDialog
        open={showGrantRole}
        onOpenChange={setShowGrantRole}
        groupId={groupId}
        isPending={grantRoleMutation.isPending}
        onSubmit={(payload) => fireRoleGrant(payload)}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title={
          revokeTarget?.kind === "Permission"
            ? "Revoke permission?"
            : "Revoke role?"
        }
        description={
          revokeTarget && (
            <p>
              Remove <strong>{revokeTarget.label}</strong> from{" "}
              <strong>{groupName}</strong>?
            </p>
          )
        }
        confirmLabel="Revoke"
        confirmLoadingLabel="Revoking…"
        isPending={revokePermMutation.isPending || revokeRoleMutation.isPending}
        onConfirm={confirmRevoke}
      />
    </section>
  );
}

function GroupGrantPermissionDialog({
  open,
  onOpenChange,
  groupId,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  isPending: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [permissions, setPermissions] = useState<PermissionSelection[]>([]);
  const [scope, setScope] = useState<ScopeValue>({
    type: "Global",
    resource: "",
  });

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
      assignedEntityType: "Group",
      assignedEntityId: groupId,
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
          <DialogTitle>Grant permissions to group</DialogTitle>
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

function GroupGrantRoleDialog({
  open,
  onOpenChange,
  groupId,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  isPending: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [roleId, setRoleId] = useState("");
  const [scope, setScope] = useState<ScopeValue>({
    type: "Global",
    resource: "",
  });

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
      assignedEntityType: "Group",
      assignedEntityId: groupId,
      type: scope.type,
      resource: scope.type === "Capability" ? scope.resource : "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant role to group</DialogTitle>
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
