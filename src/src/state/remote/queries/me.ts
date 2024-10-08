import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useMe() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["me"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return query;
}

export function useUpdateMyPersonalInformation() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: [data.profileDefinition?._links?.personalInformation.href],
        payload: {
          name: data.user.name,
          email: data.user.email,
        },
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}

export function useRegisterMyVisit() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.profileDefinition?._links?.portalVisits.href],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}
