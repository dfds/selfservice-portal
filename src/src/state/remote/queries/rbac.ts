import {
  createSsuQuery,
  createSsuParamQuery,
  createSsuMutation,
} from "../queryFactory";

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
  urlSegments: (capabilityId) => [
    "capabilities",
    capabilityId,
    "rolegrants",
  ],
  authMode: false,
});

export const useAllPermissions = createSsuQuery({
  queryKey: ["rbac", "permissions"],
  urlSegments: ["rbac/get-assignable-permissions"],
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
