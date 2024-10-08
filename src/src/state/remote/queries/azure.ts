import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useCapabilityAzureResources(capabilityDefinition: any) {
  const link = capabilityDefinition?._links?.azureResources;

  const query = useQuery({
    queryKey: ["capability-azure-resources", capabilityDefinition?.id],
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
