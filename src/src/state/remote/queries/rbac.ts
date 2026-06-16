import { useQuery } from "@tanstack/react-query";
import {
  createSsuQuery,
  createSsuParamQuery,
  createSsuMutation,
} from "../queryFactory";
import { msGraphRequest } from "../query";

// ── Member types ─────────────────────────────────────────────────────────────

export type MemberTypeFilter = "User" | "ServicePrincipal" | "All";

export interface MemberSummary {
  id: string;
  email: string;
  displayName?: string | null;
  type: "User" | "ServicePrincipal";
  lastSeen?: string | null;
  // false when the row was synthesized from an Azure AD tenant search and the user is not yet a
  // selfservice member (shown with an "Unregistered" chip). Absent/true for real local members.
  registered?: boolean;
  _links?: {
    self?: { href: string; allow: string[] };
    permissionGrants?: { href: string; allow: string[] };
    roleGrants?: { href: string; allow: string[] };
    groups?: { href: string; allow: string[] };
  };
}

export interface MemberSummaryList {
  items: MemberSummary[];
  total: number;
}

export interface SearchMembersParams {
  type?: MemberTypeFilter;
  search?: string;
  limit?: number;
  offset?: number;
}

// ── Queries ──────────────────────────────────────────────────────────────────

const _useGetRoles = createSsuQuery({
  queryKey: ["rbac", "roles"],
  urlSegments: ["rbac/get-assignable-roles"],
  authMode: false,
});

// capabilityId param is unused but kept for backward compatibility
export function useGetRoles(_capabilityId: string) {
  return _useGetRoles();
}

export const useUserRoles = createSsuParamQuery<string>({
  queryKey: (capabilityId) => ["rbac", "user-roles", capabilityId],
  urlSegments: (capabilityId) => ["capabilities", capabilityId, "rolegrants"],
  authMode: false,
});

export const useAllPermissions = createSsuQuery({
  queryKey: ["rbac", "permissions"],
  urlSegments: ["rbac/get-assignable-permissions"],
  authMode: true,
});

export const usePermissionMatrix = createSsuQuery({
  queryKey: ["rbac", "permission-matrix"],
  urlSegments: ["rbac/permission-matrix"],
  authMode: true,
});

export const useSetRolePermissions = createSsuMutation<{
  roleId: string;
  permissions: Array<{ namespace: string; name: string }>;
}>({
  method: "PUT",
  urlSegments: (data) => ["rbac", "permission-matrix", "role", data.roleId],
  payload: (data) => ({ permissions: data.permissions }),
  authMode: true,
});

export const useRolePermissions = createSsuParamQuery<string>({
  queryKey: (roleId) => ["rbac", "role-permissions", roleId],
  urlSegments: (roleId) => ["rbac", "permission", "role", roleId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useRbacGroups = createSsuQuery({
  queryKey: ["rbac", "groups"],
  urlSegments: ["rbac", "groups"],
  authMode: true,
});

export const useGroupRoles = createSsuParamQuery<string>({
  queryKey: (groupId) => ["rbac", "group-roles", groupId],
  urlSegments: (groupId) => ["rbac", "role", "groups", groupId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useGroupPermissions = createSsuParamQuery<string>({
  queryKey: (groupId) => ["rbac", "group-permissions", groupId],
  urlSegments: (groupId) => ["rbac", "permission", "group", groupId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useUserPermissions = createSsuParamQuery<string>({
  queryKey: (userId) => ["rbac", "user-permissions", userId],
  urlSegments: (userId) => ["rbac", "permission", "user", userId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useUserRbacRoles = createSsuParamQuery<string>({
  queryKey: (userId) => ["rbac", "user-roles", userId],
  urlSegments: (userId) => ["rbac", "role", "user", userId],
  authMode: true,
  enabled: (id) => !!id,
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const useGrantRole = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    data.payload.resource,
    "roles",
    "grant",
  ],
  authMode: false,
});

export const useRevokeRole = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => [
    "capabilities",
    data.payload.resource,
    "roles",
    "revoke",
    data.payload.roleGrantId,
  ],
  payload: () => null,
  authMode: false,
});

export const useCanThey = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "can-they"],
  payload: (data) => data,
  authMode: true,
});

export const useCreateRbacGroup = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "groups"],
  payload: (data) => data,
  authMode: true,
});

export const useDeleteRbacGroup = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => ["rbac", "groups", data.groupId],
  payload: () => null,
  authMode: true,
});

export const useAddRbacGroupMember = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => ["rbac", "groups", data.groupId, "members"],
  payload: (data) => ({ userId: data.userId }),
  authMode: true,
});

export const useRemoveRbacGroupMember = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => [
    "rbac",
    "groups",
    data.groupId,
    "members",
    data.memberId,
  ],
  payload: () => null,
  authMode: true,
});

export const useGrantPermissionToGroup = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "permission", "grant"],
  payload: (data) => data,
  authMode: true,
});

export const useCreateRole = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "role"],
  payload: (data) => data,
  authMode: true,
});

export const useDeleteRole = createSsuMutation<{ roleId: string }>({
  method: "DELETE",
  urlSegments: (data) => ["rbac", "role", data.roleId],
  payload: () => null,
  authMode: true,
});

export const useRevokeRbacPermission = createSsuMutation<{
  grantId: string;
}>({
  method: "DELETE",
  urlSegments: (data) => ["rbac", "permission", "revoke", data.grantId],
  payload: () => null,
  authMode: true,
});

export const useGrantRoleToGroup = createSsuMutation<{
  roleId: string;
  groupId: string;
}>({
  method: "POST",
  urlSegments: () => ["rbac", "role", "grant"],
  payload: (data) => data,
  authMode: true,
});

export const useGrantPermissionToRole = createSsuMutation<{
  roleId: string;
  permission: string;
  namespace: string;
}>({
  method: "POST",
  urlSegments: () => ["rbac", "permission", "grant"],
  payload: (data) => ({
    assignedEntityType: "Role",
    assignedEntityId: data.roleId,
    namespace: data.namespace,
    permission: data.permission,
    type: "Allow",
    resource: "",
  }),
  authMode: true,
});

// ── Phase 2: Member directory + global grant hooks ────────────────────────────

export const useSearchMembers = createSsuParamQuery<
  SearchMembersParams,
  MemberSummaryList
>({
  queryKey: (params) => [
    "rbac",
    "members",
    "search",
    params.type ?? "All",
    params.search ?? "",
    params.limit ?? 50,
    params.offset ?? 0,
  ],
  urlSegments: (params) => {
    const qs = new URLSearchParams();
    if (params.type && params.type !== "All") qs.set("type", params.type);
    if (params.search) qs.set("search", params.search);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.offset !== undefined) qs.set("offset", String(params.offset));
    const tail = qs.toString();
    return [`rbac/members${tail ? `?${tail}` : ""}`];
  },
  authMode: true,
  staleTime: 15_000,
});

export const useMember = createSsuParamQuery<string, MemberSummary>({
  queryKey: (id) => ["rbac", "members", id],
  urlSegments: (id) => ["rbac", "members", id],
  authMode: true,
  enabled: (id) => !!id,
  staleTime: 30_000,
});

export const useMemberGroups = createSsuParamQuery<string>({
  queryKey: (id) => ["rbac", "members", id, "groups"],
  urlSegments: (id) => ["rbac", "members", id, "groups"],
  authMode: true,
  enabled: (id) => !!id,
});

// Capabilities the member is an active member of. Used alongside their capability role grants to
// flag the "has a role but is not a member" drift (and offer to reconcile it).
export interface CapabilityMembership {
  capabilityId: string;
  createdAt: string;
}

export const useUserMemberships = createSsuParamQuery<
  string,
  CapabilityMembership[]
>({
  queryKey: (id) => ["rbac", "user-memberships", id],
  urlSegments: (id) => ["rbac", "members", id, "memberships"],
  authMode: true,
  enabled: (id) => !!id,
});

// Add/remove a member to/from a capability from the RBAC admin page. The API emits the proper
// UserHasJoinedCapability / UserHasLeftCapability events (unlike a raw DB restore).
export const useGrantCapabilityMembership = createSsuMutation<{
  memberId: string;
  capabilityId: string;
}>({
  method: "POST",
  urlSegments: (data) => ["rbac", "members", data.memberId, "memberships"],
  payload: (data) => ({ capabilityId: data.capabilityId }),
  authMode: true,
});

export const useRemoveCapabilityMembership = createSsuMutation<{
  memberId: string;
  capabilityId: string;
}>({
  method: "DELETE",
  urlSegments: (data) => [
    "rbac",
    "members",
    data.memberId,
    "memberships",
    data.capabilityId,
  ],
  payload: () => null,
  authMode: true,
});

// ── Azure AD tenant user search & provisioning ───────────────────────────────

export type GraphUser = {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
};

// Searches the Azure AD tenant for users by name/email via Microsoft Graph (delegated token).
// Requires the `user.read.all` scope on the acquired Graph token (see auth/context.ts). Used to
// surface people who are not yet selfservice members so an admin can pull them in.
export function useTenantUserSearch(term: string) {
  return useQuery<GraphUser[]>({
    queryKey: ["graph-user-search", term],
    queryFn: async () => {
      if (term.length < 2) return [];
      const safe = term.replace(/'/g, "''");
      const filter = `startswith(mail,'${safe}') or startswith(displayName,'${safe}')`;
      const url = `https://graph.microsoft.com/v1.0/users?$filter=${encodeURIComponent(
        filter,
      )}&$select=id,displayName,mail,userPrincipalName&$top=8`;
      const resp = await msGraphRequest({ method: "GET", url, payload: null });
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.value ?? []) as GraphUser[];
    },
    enabled: term.length >= 2,
    staleTime: 30000,
  });
}

// Provisions a local Member row for an Azure AD tenant user (id = email/UPN) so they become a
// normal selfservice member. Idempotent on the backend (RegisterUserProfile upsert).
export const useProvisionMember = createSsuMutation<{
  id: string;
  displayName?: string;
  email?: string;
}>({
  method: "POST",
  urlSegments: () => ["rbac", "members"],
  payload: (data) => ({
    id: data.id,
    displayName: data.displayName,
    email: data.email,
  }),
  authMode: true,
});

// Generic permission grant — caller supplies the full RbacPermissionGrant shape
// ({ assignedEntityType, assignedEntityId, namespace, permission, type, resource }).
export const useGrantPermission = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "permission", "grant"],
  payload: (data) => data,
  authMode: true,
});

export const useRevokePermission = createSsuMutation<{ grantId: string }>({
  method: "DELETE",
  urlSegments: (data) => ["rbac", "permission", "revoke", data.grantId],
  payload: () => null,
  authMode: true,
});

// Global (non-capability-scoped) role grant — caller supplies the full RbacRoleGrant shape.
export const useGrantRoleGlobal = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["rbac", "role", "grant"],
  payload: (data) => data,
  authMode: true,
});

export const useRevokeRoleGrant = createSsuMutation<{ grantId: string }>({
  method: "DELETE",
  urlSegments: (data) => ["rbac", "role", "revoke", data.grantId],
  payload: () => null,
  authMode: true,
});

// Group member add/remove — accept any Member (user OR service principal).
// `memberId` is the canonical field; the API also accepts `userId` for backwards compat.
export const useAddGroupMember = createSsuMutation<{
  groupId: string;
  memberId: string;
}>({
  method: "POST",
  urlSegments: (data) => ["rbac", "groups", data.groupId, "members"],
  payload: (data) => ({ groupId: data.groupId, memberId: data.memberId }),
  authMode: true,
});

export const useRemoveGroupMember = createSsuMutation<{
  groupId: string;
  memberId: string;
}>({
  method: "DELETE",
  urlSegments: (data) => [
    "rbac",
    "groups",
    data.groupId,
    "members",
    data.memberId,
  ],
  payload: () => null,
  authMode: true,
});

// Register a service principal so it shows up as an RBAC member. Idempotent:
// re-registering an existing SP is a no-op and returns the existing member.
export const useRegisterServicePrincipal = createSsuMutation<{
  id: string;
  displayName?: string | null;
}>({
  method: "POST",
  urlSegments: () => ["rbac", "service-principals"],
  payload: (data) => ({ id: data.id, displayName: data.displayName ?? null }),
  authMode: true,
});

// Bulk grants — server-side fan-out, atomic on the backend.
export const useGrantPermissionsBulk = createSsuMutation<{ grants: any[] }>({
  method: "POST",
  urlSegments: () => ["rbac", "permission", "grant-bulk"],
  payload: (data) => ({ grants: data.grants }),
  authMode: true,
});

export const useGrantRolesBulk = createSsuMutation<{ grants: any[] }>({
  method: "POST",
  urlSegments: () => ["rbac", "role", "grant-bulk"],
  payload: (data) => ({ grants: data.grants }),
  authMode: true,
});
