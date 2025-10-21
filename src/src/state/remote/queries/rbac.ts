import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useGetRoles(capabilityId: string) {
  const query = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        //urlSegments: ["rbac/role/capability", capabilityId],
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
        urlSegments: ["rbac", "role", "capability", capabilityId],
        payload: null,
        isCloudEngineerEnabled: false,
      }),
  });

  return query;
}

export function useGrantRole() {
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("useGrantRole data: ", data);
      ssuRequest({
        method: "POST",
        urlSegments: ["rbac/role/grant"],
        payload: data.payload,
        isCloudEngineerEnabled: false,
      });
    },
  });

  return mutation;
}

export function useRevokeRole() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: ["rbac/role/revoke", data.roleId],
        payload: null,
        isCloudEngineerEnabled: false,
      }),
  });

  return mutation;
}
