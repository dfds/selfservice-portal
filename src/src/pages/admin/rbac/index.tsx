import React, { useState } from "react";
import { Lock, Shield, Users, Plus, Trash2, X } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useGetRoles,
  useAllPermissions,
  useRbacGroups,
  useRolePermissions,
  useGroupRoles,
  useGroupPermissions,
  useCreateRbacGroup,
  useDeleteRbacGroup,
  useAddRbacGroupMember,
  useRemoveRbacGroupMember,
  useGrantPermissionToGroup,
  useGrantRoleToGroup,
  useCreateRole,
  useDeleteRole,
  useGrantPermissionToRole,
} from "@/state/remote/queries/rbac";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { IconButton } from "@/components/ui/IconButton";
import { ListPageContent } from "@/components/ui/ListPageContent";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useMutationToast } from "@/hooks/useMutationToast";
import { TabGroup } from "@/components/ui/TabGroup";
import { groupPermsByNamespace } from "@/lib/rbacUtils";

// API returns direct arrays, not wrapped in { items: [] }
// Permission objects: { name, description, namespace, accessType }
// Permission grant objects: { permission, namespace, type, resource, ... }
// Role grant objects: { roleId, type, resource, ... }

type Tab = "roles" | "permissions" | "groups";

// ── Role row ─────────────────────────────────────────────────────────────────

function RolePermissions({ roleId }: { roleId: string }) {
  const { data, isFetched } = useRolePermissions(roleId);
  const items: any[] = (data as any[]) ?? [];

  if (!isFetched) {
    return (
      <div className="flex flex-wrap gap-1.5 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted font-mono pt-2">
        No permissions assigned
      </p>
    );
  }

  const grouped = groupPermsByNamespace(items, "permission");
  const namespaces = Object.keys(grouped).sort();

  return (
    <div className="pt-2 space-y-2">
      {namespaces.map((ns) => (
        <div key={ns}>
          <SectionLabel className="block mb-1">{ns}</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {grouped[ns].map((p, i) => (
              <Badge
                key={`${p}-${i}`}
                variant="outline"
                className="text-[10px] font-mono"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleRow({
  role,
  onDelete,
}: {
  role: any;
  onDelete: (r: any) => void;
}) {
  return (
    <ExpandableRow
      header={
        <>
          <Lock
            size={14}
            strokeWidth={1.75}
            className="text-muted flex-shrink-0"
          />
          <span className="flex-1 text-sm font-medium text-primary">
            {role.name ?? role.id}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono hidden sm:inline-flex shrink-0"
          >
            {role.type}
          </Badge>
        </>
      }
      actions={
        <IconButton
          size="sm"
          colorScheme="destructive"
          onClick={() => onDelete(role)}
          aria-label={`Delete role ${role.name ?? role.id}`}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </IconButton>
      }
    >
      <RolePermissions roleId={role.id} />
    </ExpandableRow>
  );
}

// ── Permissions tab ───────────────────────────────────────────────────────────

function PermissionsTab() {
  const { data, isFetched } = useAllPermissions();
  const items: any[] = (data as any[]) ?? [];

  if (!isFetched) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-card rounded-[8px] p-4 space-y-2"
          >
            <Skeleton className="h-3.5 w-32" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-24 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState>No permissions found.</EmptyState>;
  }

  const grouped = groupPermsByNamespace(items, "name");
  const namespaces = Object.keys(grouped).sort();

  return (
    <div className="space-y-3">
      {namespaces.map((ns) => (
        <div key={ns} className="border border-card rounded-[8px] p-4">
          <SectionLabel className="block mb-2">{ns}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {grouped[ns].map((p, i) => (
              <Badge
                key={`${p}-${i}`}
                variant="outline"
                className="text-[10px] font-mono"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Group expanded content ────────────────────────────────────────────────────

function GroupExpandedContent({
  groupId,
  members,
  onMembersChanged,
}: {
  groupId: string;
  members: any[];
  onMembersChanged: () => void;
}) {
  const toast = useToast();
  const { data: rolesData, isFetched: rolesFetched } = useGroupRoles(groupId);
  const { data: permsData, isFetched: permsFetched } =
    useGroupPermissions(groupId);
  const { data: allRolesData } = useGetRoles("");
  const addMember = useAddRbacGroupMember();
  const removeMember = useRemoveRbacGroupMember();
  const grantRole = useGrantRoleToGroup();
  const grantPerm = useGrantPermissionToGroup();

  const [addMemberInput, setAddMemberInput] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState("");
  const [showGrantPerm, setShowGrantPerm] = useState(false);
  const [grantPermName, setGrantPermName] = useState("");
  const [grantPermNamespace, setGrantPermNamespace] = useState("");

  const roles: any[] = (rolesData as any[]) ?? [];
  const allRoles: any[] = (allRolesData as any[]) ?? [];
  const rolesNameMap: Record<string, string> = allRoles.reduce(
    (acc, r: any) => {
      if (r.id) acc[r.id] = r.name ?? r.id;
      return acc;
    },
    {},
  );
  const perms: any[] = (permsData as any[]) ?? [];

  const fireAssignRole = useMutationToast(grantRole, {
    invalidateKeys: [["rbac", "group-roles", groupId]],
    successMessage: "Role assigned",
    errorMessage: "Could not assign role",
    onSuccess: () => {
      setAssignRoleId("");
      setShowAssignRole(false);
    },
  });

  const fireGrantPerm = useMutationToast(grantPerm, {
    invalidateKeys: [["rbac", "group-permissions", groupId]],
    successMessage: "Permission granted",
    errorMessage: "Could not grant permission",
    onSuccess: () => {
      setGrantPermName("");
      setGrantPermNamespace("");
      setShowGrantPerm(false);
    },
  });

  const fireAddMember = useMutationToast(addMember, {
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Member added",
    errorMessage: "Could not add member",
    onSuccess: () => {
      setAddMemberInput("");
      setShowAddMember(false);
      onMembersChanged();
    },
  });

  const fireRemoveMember = useMutationToast(removeMember, {
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Member removed",
    errorMessage: "Could not remove member",
    onSuccess: () => onMembersChanged(),
  });

  function handleAssignRole(e: React.FormEvent) {
    e.preventDefault();
    if (!assignRoleId.trim()) return;
    fireAssignRole({ roleId: assignRoleId.trim(), groupId });
  }

  function handleGrantPerm(e: React.FormEvent) {
    e.preventDefault();
    if (!grantPermName.trim()) return;
    fireGrantPerm({
      permissionName: grantPermName.trim(),
      namespace: grantPermNamespace.trim(),
      groupId,
    });
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!addMemberInput.trim()) return;
    fireAddMember({ groupId, userId: addMemberInput.trim() });
  }

  if (!rolesFetched || !permsFetched) {
    return (
      <div className="pt-2 space-y-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-40 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-3">
      {/* Members */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SectionLabel className="block">
            Members ({members.length})
          </SectionLabel>
          <button
            type="button"
            onClick={() => setShowAddMember((v) => !v)}
            className="p-0.5 rounded text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Add member"
          >
            <Plus size={12} strokeWidth={1.75} />
          </button>
        </div>
        {showAddMember && (
          <form onSubmit={handleAddMember} className="flex gap-1.5 mb-2">
            <Input
              placeholder="User ID"
              value={addMemberInput}
              onChange={(e) => setAddMemberInput(e.target.value)}
              className="text-xs font-mono h-7"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!addMemberInput.trim() || addMember.isPending}
              className="h-7 px-2 text-xs"
            >
              Add
            </Button>
          </form>
        )}
        {members.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-1.5 group">
                <span className="text-xs text-primary font-mono flex-1">
                  {m.userId}
                </span>
                <button
                  type="button"
                  onClick={() => fireRemoveMember({ groupId, memberId: m.id })}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted hover:text-destructive transition-all cursor-pointer border-0 bg-transparent"
                  aria-label={`Remove ${m.userId}`}
                >
                  <X size={11} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted font-mono">No members</p>
        )}
      </div>

      {/* Roles */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SectionLabel className="block">Roles ({roles.length})</SectionLabel>
          <button
            type="button"
            onClick={() => setShowAssignRole((v) => !v)}
            className="p-0.5 rounded text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Assign role"
          >
            <Plus size={12} strokeWidth={1.75} />
          </button>
        </div>
        {showAssignRole && (
          <form onSubmit={handleAssignRole} className="flex gap-1.5 mb-2">
            <select
              value={assignRoleId}
              onChange={(e) => setAssignRoleId(e.target.value)}
              className="flex-1 text-xs font-mono h-7 border border-input rounded-[4px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
            >
              <option value="">Select role…</option>
              {allRoles.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name ?? r.id}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!assignRoleId || grantRole.isPending}
              className="h-7 px-2 text-xs"
            >
              Assign
            </Button>
          </form>
        )}
        {roles.length > 0 ? (
          <div className="flex flex-col gap-1">
            {roles.map((r: any, i: number) => {
              const roleId = r.roleId ?? r.id;
              const roleName = rolesNameMap[roleId] ?? roleId;
              const scope = r.resource
                ? `${r.type ? `${r.type}: ` : ""}${r.resource}`
                : r.type ?? "Global";
              return (
                <div
                  key={`${roleId}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {roleName}
                  </Badge>
                  <span className="text-[10px] text-muted font-mono">
                    {scope}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          !showAssignRole && (
            <p className="text-xs text-muted font-mono">No roles</p>
          )
        )}
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SectionLabel className="block">
            Permissions ({perms.length})
          </SectionLabel>
          <button
            type="button"
            onClick={() => setShowGrantPerm((v) => !v)}
            className="p-0.5 rounded text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
            aria-label="Grant permission"
          >
            <Plus size={12} strokeWidth={1.75} />
          </button>
        </div>
        {showGrantPerm && (
          <form
            onSubmit={handleGrantPerm}
            className="flex flex-col gap-1.5 mb-2"
          >
            <div className="flex gap-1.5">
              <Input
                placeholder="Permission name"
                value={grantPermName}
                onChange={(e) => setGrantPermName(e.target.value)}
                className="text-xs font-mono h-7"
              />
              <Input
                placeholder="Namespace"
                value={grantPermNamespace}
                onChange={(e) => setGrantPermNamespace(e.target.value)}
                className="text-xs font-mono h-7 w-32"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={!grantPermName.trim() || grantPerm.isPending}
                className="h-7 px-2 text-xs"
              >
                Grant
              </Button>
            </div>
          </form>
        )}
        {perms.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {perms.map((p: any, i: number) => (
              <Badge
                key={`${p.permission}-${i}`}
                variant="outline"
                className="text-[10px] font-mono"
              >
                {p.permission}
              </Badge>
            ))}
          </div>
        ) : (
          !showGrantPerm && (
            <p className="text-xs text-muted font-mono">No permissions</p>
          )
        )}
      </div>
    </div>
  );
}

function GroupRow({
  group,
  onDelete,
}: {
  group: any;
  onDelete: (g: any) => void;
}) {
  const [localMembers, setLocalMembers] = useState<any[] | null>(null);

  const members = localMembers ?? group.members ?? [];
  const memberCount: number = members.length;

  return (
    <ExpandableRow
      header={
        <>
          <Users
            size={14}
            strokeWidth={1.75}
            className="text-muted flex-shrink-0"
          />
          <span className="flex-1 text-sm font-medium text-primary">
            {group.name ?? group.id}
          </span>
          <span className="text-xs text-muted font-mono shrink-0">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </>
      }
      actions={
        <IconButton
          size="sm"
          colorScheme="destructive"
          onClick={() => onDelete(group)}
          aria-label={`Delete group ${group.name ?? group.id}`}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </IconButton>
      }
    >
      <GroupExpandedContent
        groupId={group.id}
        members={members}
        onMembersChanged={() => setLocalMembers(null)}
      />
    </ExpandableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "roles", label: "Roles", Icon: Lock },
  { id: "permissions", label: "Permissions", Icon: Shield },
  { id: "groups", label: "Groups", Icon: Users },
];

export default function RbacViewerPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("roles");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [isGrantingPerms, setIsGrantingPerms] = useState(false);

  const createGroup = useCreateRbacGroup();
  const deleteGroup = useDeleteRbacGroup();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const grantPermToRole = useGrantPermissionToRole();

  const { data: allPermsData } = useAllPermissions();
  const allPerms: any[] = (allPermsData as any[]) ?? [];

  const { data: rolesData, isFetched: rolesFetched } = useGetRoles("");
  const roles: any[] = (rolesData as any[]) ?? [];

  const { data: groupsData, isFetched: groupsFetched } = useRbacGroups();
  const groups: any[] = (groupsData as any[]) ?? [];

  function resetCreateRoleForm() {
    setNewRoleName("");
    setNewRoleDescription("");
    setShowCreateRole(false);
    setCreatedRoleId(null);
    setSelectedPerms(new Set());
    setIsGrantingPerms(false);
  }

  async function handleGrantAndClose() {
    if (!createdRoleId) return;
    setIsGrantingPerms(true);
    let failed = 0;
    for (const key of selectedPerms) {
      const [namespace, permission] = key.split("||");
      try {
        await grantPermToRole.mutateAsync({
          roleId: createdRoleId,
          permission,
          namespace,
        });
      } catch {
        failed++;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["rbac", "role-permissions"] });
    if (failed > 0) {
      toast.error(
        `${selectedPerms.size - failed}/${
          selectedPerms.size
        } permissions granted`,
      );
    } else {
      toast.success(`Role created with ${selectedPerms.size} permissions`);
    }
    resetCreateRoleForm();
  }

  const fireCreateRole = useMutationToast(createRole, {
    invalidateKeys: [["rbac", "roles"]],
    successMessage: "Role created",
    errorMessage: "Could not create role",
    onSuccess: (response: any) => {
      setCreatedRoleId(response?.id ?? null);
      if (!response?.id) {
        setNewRoleName("");
        setNewRoleDescription("");
        setShowCreateRole(false);
      }
    },
  });

  const deleteRoleConfirm = useConfirmAction({
    mutation: deleteRole,
    buildPayload: (r: any) => ({ roleId: r.id }),
    invalidateKeys: [["rbac", "roles"]],
    successMessage: "Role deleted",
    errorMessage: "Could not delete role",
  });

  const fireCreateGroup = useMutationToast(createGroup, {
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Group created",
    errorMessage: "Could not create group",
    onSuccess: () => {
      setNewGroupName("");
      setShowCreateGroup(false);
    },
  });

  const deleteGroupConfirm = useConfirmAction({
    mutation: deleteGroup,
    buildPayload: (g: any) => ({ groupId: g.id }),
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Group deleted",
    errorMessage: "Could not delete group",
  });

  function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    fireCreateRole({
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
      type: "global",
    });
  }

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    fireCreateGroup({ name: newGroupName.trim() });
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="RBAC Viewer"
        subtitle="View and manage roles, permissions, and groups across the platform."
      />

      {/* Tab bar */}
      <TabGroup
        tabs={TABS.map(({ id, label, Icon }) => ({
          id,
          label,
          icon: <Icon size={14} strokeWidth={1.75} />,
        }))}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {/* Roles tab */}
      {tab === "roles" && (
        <div className="animate-fade-up">
          <div className="flex justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateRole((v) => !v)}
            >
              <Plus size={13} strokeWidth={1.75} className="mr-1.5" />
              Create Role
            </Button>
          </div>

          {showCreateRole && (
            <div className="flex flex-col gap-2 mb-4 p-3 border border-card rounded-[8px] bg-surface-muted/40">
              {!createdRoleId && (
                <form
                  onSubmit={handleCreateRole}
                  className="flex flex-col gap-2"
                >
                  <Input
                    placeholder="Role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="text-sm font-mono"
                    autoFocus
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={!newRoleName.trim() || createRole.isPending}
                    >
                      {createRole.isPending ? "Creating…" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetCreateRoleForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {createdRoleId && (
                <div className="flex flex-col gap-2">
                  <SectionLabel className="block">
                    Assign initial permissions (optional)
                  </SectionLabel>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {Object.entries(groupPermsByNamespace(allPerms, "name"))
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([ns, permNames]) => (
                        <div key={ns}>
                          <SectionLabel className="block mb-1">
                            {ns}
                          </SectionLabel>
                          <div className="flex flex-wrap gap-1.5">
                            {permNames.map((p) => {
                              const key = `${ns}||${p}`;
                              return (
                                <label
                                  key={key}
                                  className="flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPerms.has(key)}
                                    onChange={() => {
                                      setSelectedPerms((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(key)) {
                                          next.delete(key);
                                        } else {
                                          next.add(key);
                                        }
                                        return next;
                                      });
                                    }}
                                  />
                                  {p}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={selectedPerms.size === 0 || isGrantingPerms}
                      onClick={handleGrantAndClose}
                    >
                      {isGrantingPerms ? "Granting…" : "Grant & Close"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetCreateRoleForm}
                    >
                      Skip & Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <ListPageContent
            isFetched={rolesFetched}
            items={roles}
            renderItem={(role: any) => (
              <RoleRow
                key={role.id}
                role={role}
                onDelete={deleteRoleConfirm.setTarget}
              />
            )}
            skeletonCount={4}
            renderSkeleton={(i) => (
              <div key={i} className="border border-card rounded-[8px] p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-24 rounded-full ml-auto" />
                </div>
              </div>
            )}
            emptyMessage="No roles found."
          />
        </div>
      )}

      {/* Permissions tab */}
      {tab === "permissions" && (
        <div className="animate-fade-up">
          <PermissionsTab />
        </div>
      )}

      {/* Groups tab */}
      {tab === "groups" && (
        <div className="animate-fade-up">
          <div className="flex justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateGroup((v) => !v)}
            >
              <Plus size={13} strokeWidth={1.75} className="mr-1.5" />
              Create Group
            </Button>
          </div>

          {showCreateGroup && (
            <form
              onSubmit={handleCreateGroup}
              className="flex gap-2 mb-4 p-3 border border-card rounded-[8px] bg-surface-muted/40"
            >
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-sm font-mono"
                autoFocus
              />
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!newGroupName.trim() || createGroup.isPending}
              >
                {createGroup.isPending ? "Creating…" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateGroup(false);
                  setNewGroupName("");
                }}
              >
                Cancel
              </Button>
            </form>
          )}

          <ListPageContent
            isFetched={groupsFetched}
            items={groups}
            renderItem={(group: any) => (
              <GroupRow
                key={group.id}
                group={group}
                onDelete={deleteGroupConfirm.setTarget}
              />
            )}
            skeletonCount={3}
            renderSkeleton={(i) => (
              <div key={i} className="border border-card rounded-[8px] p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            )}
            emptyMessage="No groups found."
          />
        </div>
      )}

      {/* Delete role confirmation dialog */}
      <ConfirmDialog
        {...deleteRoleConfirm.dialogProps}
        title="Delete role?"
        description={
          <p>
            Permanently delete role{" "}
            <span className="font-medium text-primary">
              {deleteRoleConfirm.target?.name ?? deleteRoleConfirm.target?.id}
            </span>
            ? This cannot be undone.
          </p>
        }
        confirmLabel="Delete Role"
        confirmLoadingLabel="Deleting…"
      />

      {/* Delete group confirmation dialog */}
      <ConfirmDialog
        {...deleteGroupConfirm.dialogProps}
        title="Delete group?"
        description={
          <p>
            Permanently delete group{" "}
            <span className="font-medium text-primary">
              {deleteGroupConfirm.target?.name ?? deleteGroupConfirm.target?.id}
            </span>
            ? This cannot be undone.
          </p>
        }
        confirmLabel="Delete Group"
        confirmLoadingLabel="Deleting…"
      />
    </div>
  );
}
