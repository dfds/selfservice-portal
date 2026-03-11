import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useGetRoles(capabilityId: string) {
  const query = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac/get-assignable-roles"],
        payload: null,
        isCloudEngineerEnabled: false,
      }),
  });

  return query;
}

export function useUserRoles(capabilityId: string) {
  const query = useQuery({
    queryKey: ["rbac", "user-roles", capabilityId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", capabilityId, "rolegrants"],
        payload: null,
        isCloudEngineerEnabled: false,
      }),
  });

  return query;
}

export function useGrantRole() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", data.payload.resource, "roles", "grant"],
        payload: data.payload,
        isCloudEngineerEnabled: false,
      }),
  });

  return mutation;
}

export function useRevokeRole() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: [
          "capabilities",
          data.payload.resource,
          "roles",
          "revoke",
          data.payload.roleGrantId,
        ],
        payload: null,
        isCloudEngineerEnabled: false,
      }),
  });

  return mutation;
}

export function useAllPermissions() {
  const query = useQuery({
    queryKey: ["rbac", "permissions"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac/get-assignable-permissions"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
  return query;
}

export function useRolePermissions(roleId: string) {
  const query = useQuery({
    queryKey: ["rbac", "role-permissions", roleId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "permission", "role", roleId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!roleId,
  });
  return query;
}

export function useRbacGroups() {
  const query = useQuery({
    queryKey: ["rbac", "groups"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "groups"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
  return query;
}

export function useGroupRoles(groupId: string) {
  const query = useQuery({
    queryKey: ["rbac", "group-roles", groupId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "role", "groups", groupId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!groupId,
  });
  return query;
}

export function useGroupPermissions(groupId: string) {
  const query = useQuery({
    queryKey: ["rbac", "group-permissions", groupId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "permission", "group", groupId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!groupId,
  });
  return query;
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["rbac", "user-permissions", userId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "permission", "user", userId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!userId,
  });
}

export function useUserRbacRoles(userId: string) {
  return useQuery({
    queryKey: ["rbac", "user-roles", userId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["rbac", "role", "user", userId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!userId,
  });
}

export function useCanThey() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "can-they"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useCreateRbacGroup() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "groups"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useDeleteRbacGroup() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["rbac", "groups", data.groupId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useAddRbacGroupMember() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "groups", data.groupId, "members"],
        payload: { userId: data.userId },
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useRemoveRbacGroupMember() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: [
          "rbac",
          "groups",
          data.groupId,
          "members",
          data.memberId,
        ],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useGrantPermissionToGroup() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "permission", "grant"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useCreateRole() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "role"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useDeleteRole() {
  return useMutation({
    mutationFn: async (data: { roleId: string }) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["rbac", "role", data.roleId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useRevokeRbacPermission() {
  return useMutation({
    mutationFn: async (data: { grantId: string }) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["rbac", "permission", "revoke", data.grantId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useGrantRoleToGroup() {
  return useMutation({
    mutationFn: async (data: { roleId: string; groupId: string }) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "role", "grant"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useGrantPermissionToRole() {
  return useMutation({
    mutationFn: async (data: {
      roleId: string;
      permission: string;
      namespace: string;
    }) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac", "permission", "grant"],
        payload: {
          assignedEntityType: "Role",
          assignedEntityId: data.roleId,
          namespace: data.namespace,
          permission: data.permission,
          type: "Allow",
          resource: "",
        },
        isCloudEngineerEnabled: true,
      }),
  });
}
