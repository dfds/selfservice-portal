import React, { useState } from "react";
import { ChevronDown, Lock, Shield, Users, Plus, Trash2, X } from "lucide-react";
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
} from "@/state/remote/queries/rbac";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// API returns direct arrays, not wrapped in { items: [] }
// Permission objects: { name, description, namespace, accessType }
// Permission grant objects: { permission, namespace, type, resource, ... }
// Role grant objects: { roleId, type, resource, ... }

type Tab = "roles" | "permissions" | "groups";

function groupPermsByNamespace(
  items: any[],
  nameField: string,
): Record<string, string[]> {
  return items.reduce<Record<string, string[]>>((acc, item) => {
    const ns = item.namespace ?? "Other";
    const name = item[nameField] ?? "";
    if (!acc[ns]) acc[ns] = [];
    acc[ns].push(name);
    return acc;
  }, {});
}

// ── Role row ─────────────────────────────────────────────────────────────────

function RolePermissions({ roleId }: { roleId: string }) {
  const { data, isFetched } = useRolePermissions(roleId);
  // API returns a direct array of permission grant objects
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

  // Group by namespace, display the permission name
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
  const [expanded, setExpanded] = useState(false);
  const [triggered, setTriggered] = useState(false);

  function handleClick() {
    if (!triggered) setTriggered(true);
    setExpanded((e) => !e);
  }

  return (
    <div className="border border-card rounded-[8px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={handleClick}
          className="flex-1 flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer p-0 min-w-0"
        >
          <Lock size={14} strokeWidth={1.75} className="text-muted flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-primary">
            {role.name ?? role.id}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex shrink-0">
            {role.type}
          </Badge>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn(
              "text-muted transition-transform duration-200 flex-shrink-0",
              expanded && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          onClick={() => onDelete(role)}
          className="flex-shrink-0 p-1.5 rounded-[4px] text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-0 bg-transparent"
          aria-label={`Delete role ${role.name ?? role.id}`}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-card bg-surface-muted/40">
          {triggered && <RolePermissions roleId={role.id} />}
        </div>
      )}
    </div>
  );
}

// ── Permissions tab ───────────────────────────────────────────────────────────

function PermissionsTab() {
  const { data, isFetched } = useAllPermissions();
  // API returns a direct array of { name, description, namespace, accessType }
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

  // Group by namespace field, display the name field
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

  // Role grants: { roleId, type, resource, ... } — look up name from allRoles
  const roles: any[] = (rolesData as any[]) ?? [];
  const allRoles: any[] = (allRolesData as any[]) ?? [];
  const rolesNameMap: Record<string, string> = allRoles.reduce((acc, r: any) => {
    if (r.id) acc[r.id] = r.name ?? r.id;
    return acc;
  }, {});
  // Permission grants: { permission, namespace, type, ... }
  const perms: any[] = (permsData as any[]) ?? [];

  function handleAssignRole(e: React.FormEvent) {
    e.preventDefault();
    if (!assignRoleId.trim()) return;
    grantRole.mutate(
      { roleId: assignRoleId.trim(), groupId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "group-roles", groupId] });
          toast.success("Role assigned");
          setAssignRoleId("");
          setShowAssignRole(false);
        },
        onError: () => toast.error("Could not assign role"),
      },
    );
  }

  function handleGrantPerm(e: React.FormEvent) {
    e.preventDefault();
    if (!grantPermName.trim()) return;
    grantPerm.mutate(
      { permissionName: grantPermName.trim(), namespace: grantPermNamespace.trim(), groupId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "group-permissions", groupId] });
          toast.success("Permission granted");
          setGrantPermName("");
          setGrantPermNamespace("");
          setShowGrantPerm(false);
        },
        onError: () => toast.error("Could not grant permission"),
      },
    );
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!addMemberInput.trim()) return;
    addMember.mutate(
      { groupId, userId: addMemberInput.trim() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "groups"] });
          toast.success("Member added");
          setAddMemberInput("");
          setShowAddMember(false);
          onMembersChanged();
        },
        onError: () => {
          toast.error("Could not add member");
        },
      },
    );
  }

  function handleRemoveMember(memberId: string) {
    removeMember.mutate(
      { groupId, memberId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "groups"] });
          toast.success("Member removed");
          onMembersChanged();
        },
        onError: () => {
          toast.error("Could not remove member");
        },
      },
    );
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
                  onClick={() => handleRemoveMember(m.id)}
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
                <option key={r.id} value={r.id}>{r.name ?? r.id}</option>
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
                : (r.type ?? "Global");
              return (
                <div key={`${roleId}-${i}`} className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {roleName}
                  </Badge>
                  <span className="text-[10px] text-muted font-mono">{scope}</span>
                </div>
              );
            })}
          </div>
        ) : (
          !showAssignRole && <p className="text-xs text-muted font-mono">No roles</p>
        )}
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SectionLabel className="block">Permissions ({perms.length})</SectionLabel>
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
          <form onSubmit={handleGrantPerm} className="flex flex-col gap-1.5 mb-2">
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
          !showGrantPerm && <p className="text-xs text-muted font-mono">No permissions</p>
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
  const [expanded, setExpanded] = useState(false);
  const [localMembers, setLocalMembers] = useState<any[] | null>(null);

  const members = localMembers ?? group.members ?? [];
  const memberCount: number = members.length;

  return (
    <div className="border border-card rounded-[8px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer p-0 min-w-0"
        >
          <Users size={14} strokeWidth={1.75} className="text-muted flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-primary">
            {group.name ?? group.id}
          </span>
          <span className="text-xs text-muted font-mono shrink-0">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn(
              "text-muted transition-transform duration-200 flex-shrink-0",
              expanded && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          onClick={() => onDelete(group)}
          className="flex-shrink-0 p-1.5 rounded-[4px] text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-0 bg-transparent"
          aria-label={`Delete group ${group.name ?? group.id}`}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-card bg-surface-muted/40">
          <GroupExpandedContent
            groupId={group.id}
            members={members}
            onMembersChanged={() => setLocalMembers(null)}
          />
        </div>
      )}
    </div>
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
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<any>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const createGroup = useCreateRbacGroup();
  const deleteGroup = useDeleteRbacGroup();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();

  // API returns direct arrays
  const { data: rolesData, isFetched: rolesFetched } = useGetRoles("");
  const roles: any[] = (rolesData as any[]) ?? [];

  const { data: groupsData, isFetched: groupsFetched } = useRbacGroups();
  const groups: any[] = (groupsData as any[]) ?? [];

  function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createRole.mutate(
      { name: newRoleName.trim(), description: newRoleDescription.trim(), type: "global" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
          toast.success("Role created");
          setNewRoleName("");
          setNewRoleDescription("");
          setShowCreateRole(false);
        },
        onError: () => {
          toast.error("Could not create role");
        },
      },
    );
  }

  function handleConfirmDeleteRole() {
    if (!deleteRoleTarget) return;
    deleteRole.mutate(
      { roleId: deleteRoleTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
          toast.success("Role deleted");
          setDeleteRoleTarget(null);
        },
        onError: () => {
          toast.error("Could not delete role");
          setDeleteRoleTarget(null);
        },
      },
    );
  }

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createGroup.mutate(
      { name: newGroupName.trim() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "groups"] });
          toast.success("Group created");
          setNewGroupName("");
          setShowCreateGroup(false);
        },
        onError: () => {
          toast.error("Could not create group");
        },
      },
    );
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteGroup.mutate(
      { groupId: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "groups"] });
          toast.success("Group deleted");
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error("Could not delete group");
          setDeleteTarget(null);
        },
      },
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
          // Admin
        </div>
        <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
          RBAC Viewer
        </h1>
        <p className="text-sm text-muted mt-1">
          View and manage roles, permissions, and groups across the platform.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-surface-muted rounded-[8px] mb-6 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-medium transition-colors cursor-pointer border-0",
              tab === id
                ? "bg-white dark:bg-slate-700 text-primary shadow-card"
                : "text-secondary hover:text-primary bg-transparent",
            )}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>

      {/* Roles tab */}
      {tab === "roles" && (
        <div className="animate-fade-up">
          {/* Create role button */}
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

          {/* Create role inline form */}
          {showCreateRole && (
            <form
              onSubmit={handleCreateRole}
              className="flex flex-col gap-2 mb-4 p-3 border border-card rounded-[8px] bg-surface-muted/40"
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
                  onClick={() => {
                    setShowCreateRole(false);
                    setNewRoleName("");
                    setNewRoleDescription("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {!rolesFetched ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-card rounded-[8px] p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full ml-auto" />
                  </div>
                </div>
              ))
            ) : roles.length === 0 ? (
              <EmptyState>No roles found.</EmptyState>
            ) : (
              roles.map((role: any) => (
                <RoleRow key={role.id} role={role} onDelete={setDeleteRoleTarget} />
              ))
            )}
          </div>
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
          {/* Create group button */}
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

          {/* Create group inline form */}
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

          <div className="space-y-2">
            {!groupsFetched ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-card rounded-[8px] p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))
            ) : groups.length === 0 ? (
              <EmptyState>No groups found.</EmptyState>
            ) : (
              groups.map((group: any) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Delete role confirmation dialog */}
      <Dialog
        open={!!deleteRoleTarget}
        onOpenChange={(open) => !open && setDeleteRoleTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            Permanently delete role{" "}
            <span className="font-medium text-primary">
              {deleteRoleTarget?.name ?? deleteRoleTarget?.id}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteRoleTarget(null)}
              disabled={deleteRole.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteRole}
              disabled={deleteRole.isPending}
            >
              {deleteRole.isPending ? "Deleting…" : "Delete Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete group confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            Permanently delete group{" "}
            <span className="font-medium text-primary">
              {deleteTarget?.name ?? deleteTarget?.id}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteGroup.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? "Deleting…" : "Delete Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
