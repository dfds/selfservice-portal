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
    mutationFn: async (data: any) => {
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", data.payload.resource, "roles", "grant"],
        payload: data.payload,
        isCloudEngineerEnabled: false,
      });
    },
  });

  return mutation;
}

export function useRevokeRole() {
  const mutation = useMutation({
    mutationFn: async (data: any) => {
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
      });
    },
  });

  return mutation;
}
