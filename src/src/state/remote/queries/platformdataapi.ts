import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

export function useCapabilitiesCost() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["capabilities", "metrics", "cost", "list"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["metrics", "my-capabilities-costs"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let mapped = new Map();
      for (let val of data.costs) {
        let costs = val.costs.map((x) => {
          return {
            name: x.timeStamp,
            pv: Math.floor(x.value),
          };
        });
        mapped.set(val.capabilityId, costs);
      }
      return mapped;
    },
    staleTime: 60000,
  });

  var getCostsForCapability = (capabilityId, daysWindow) => {
    if (daysWindow > 30) {
      throw new Error("Days window size is too large");
    }

    if (!query.isFetched) {
      return [];
    }

    if (!query.data.has(capabilityId)) {
      return [];
    }

    let these_costs = query.data.get(capabilityId);
    if (these_costs.length <= daysWindow) {
      return these_costs;
    }
    return these_costs.slice(-daysWindow);
  };

  return {
    query: query,
    getCostsForCapability: getCostsForCapability,
  };
}

export function useCapabilitiesAwsResources() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["capabilities", "metrics", "aws-resources", "list"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["metrics", "my-capabilities-resources"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let mapped = new Map();
      for (let val of data.capabilityAwsResourceCounts) {
        mapped.set(val.capabilityId, val.awsResourceCounts);
      }
      return mapped;
    },
    staleTime: 60000,
  });

  var getAwsResourcesTotalCountForCapability = (capabilityId) => {
    if (!query.isFetched) {
      return 0;
    }
    const counts = query.data.get(capabilityId);
    if (counts === undefined) {
      return 0;
    }
    let total = 0;
    // eslint-disable-next-line no-unused-vars
    for (let resource of counts) {
      total += resource.resourceCount;
    }
    return total;
  };

  var getAwsResourceCountsForCapability = (capabilityId) => {
    if (!query.isFetched) {
      return new Map();
    }
    const counts = query.data.get(capabilityId);
    if (counts === undefined) {
      return new Map();
    }

    return counts;
  };

  var getAwsResourceCountsForCapabilityAndType = (
    capabilityId,
    resourceType,
  ) => {
    if (!query.isFetched) {
      return 0;
    }
    const counts = query.data.get(capabilityId);
    if (counts === undefined) {
      return 0;
    }
    let total = 0;
    // eslint-disable-next-line no-unused-vars
    for (let resource of counts) {
      if (resource.resourceId.includes(resourceType))
        total += resource.resourceCount;
    }
    return total;
  };

  return {
    query: query,
    getAwsResourcesTotalCountForCapability:
      getAwsResourcesTotalCountForCapability,
    getAwsResourceCountsForCapability: getAwsResourceCountsForCapability,
    getAwsResourceCountsForCapabilityAndType:
      getAwsResourceCountsForCapabilityAndType,
  };
}
