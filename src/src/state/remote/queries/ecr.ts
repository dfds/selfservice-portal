import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useEcrRepositories() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["ecr", "repositories"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["ecr/repositories"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return query;
}

export function useCreateEcrRepository() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["ecr/repositories"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useEcrOutOfSyncInfo() {
  return useQuery({
    queryKey: ["ecr", "out-of-sync"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["metrics/out-of-sync-ecr-repos"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    staleTime: 30000,
  });
}

export function useSyncEcr() {
  return useMutation({
    mutationFn: async (data: { updateOnMismatch: boolean }) =>
      ssuRequest({
        method: "POST",
        urlSegments: [`ecr/synchronize?updateOnMismatch=${data.updateOnMismatch}`],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });
}
