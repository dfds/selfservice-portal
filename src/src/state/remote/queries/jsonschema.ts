import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useJsonSchema(schemaId: string) {
  return useQuery({
    queryKey: ["json-schema", schemaId],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["json-schema", schemaId],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!schemaId,
  });
}

export function useUpdateJsonSchema() {
  return useMutation({
    mutationFn: async (data: { schemaId: string; schema: any }) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["json-schema", data.schemaId],
        payload: data.schema,
        isCloudEngineerEnabled: true,
      }),
  });
}

export function useValidateJsonSchema() {
  return useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["json-schema", "validate"],
        payload: data,
        isCloudEngineerEnabled: true,
      }),
  });
}
