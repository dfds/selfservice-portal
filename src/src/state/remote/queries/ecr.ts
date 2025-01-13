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
