import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useMe() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["me"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    staleTime: 30000,
  });

  return query;
}

export function useUpdateMyPersonalInformation() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "PUT",
        urlSegments: [data.profileDefinition?._links?.personalInformation.href],
        payload: {
          name: data.user.name,
          email: data.user.email,
        },
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useUpdateUserSettingsInformation() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["me", "settings"],
        payload: data,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}


export function useRegisterMyVisit() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.profileDefinition?._links?.portalVisits.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}
