import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useEcrRepositories() {
  const query = useQuery({
    queryKey: ["ecr", "repositories"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["ecr/repositories"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return query;
}

export function useCreateEcrRepository() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["ecr/repositories"],
        payload: data.payload,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}
