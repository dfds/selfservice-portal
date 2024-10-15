import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useCapabilityAzureResources(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.azureResources;

  const query = useQuery({
    queryKey: [
      "capabilities",
      "azure",
      "azure-resources",
      capabilityDefinition?.id,
    ],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    enabled: !!link,
  });

  return query;
}

export function useCapabilityAzureResourceRequest() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          "capabilities",
          data.capabilityDefinition.id,
          "azureresources",
        ],
        payload: data.payload,
        isCloudEngineerEnabled: true,
      }),
  });

  return mutation;
}
