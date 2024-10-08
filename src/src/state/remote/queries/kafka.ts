import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useKafkaClustersAccessList(capabilityDefinition) {
  const clustersLink = capabilityDefinition?._links?.clusters;

  const query = useQuery({
    queryKey: ["kafka-clusters-list", capabilityDefinition?.id],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [clustersLink.href],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => data.items,
    enabled: !!clustersLink,
  });

  return query;
}
