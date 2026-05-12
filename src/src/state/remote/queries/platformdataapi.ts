import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

let useDummyData = false;

/** Generates deterministic dummy cost data for development when the API returns nothing. */
function generateDummyCosts(capabilityId: string, days: number) {
  // Seed a simple LCG from the capability ID so each capability looks different
  // but renders consistently across re-renders.
  let seed = capabilityId
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  const baseValue = 20 + rand() * 80; // $20–$100 / day base
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      name: date.toISOString().split("T")[0],
      pv: Math.max(1, Math.floor(baseValue + (rand() - 0.5) * baseValue * 0.4)),
    };
  });
}

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
    if (daysWindow > 60) {
      throw new Error("Days window size is too large");
    }

    const realData =
      query.isFetched &&
        query.data != null &&
        query.data.has(capabilityId)
        ? query.data.get(capabilityId)
        : null;

    if (realData == null) {
      if (useDummyData) {
        // Always generate from a fixed 60-day pool so that any two windows
        // (e.g. getCostsForCapability(id, 7) and getCostsForCapability(id, 14))
        // are consistent slices of the same underlying series.
        return generateDummyCosts(capabilityId, 60).slice(-daysWindow);
      }
      return [];
    }

    if (realData.length <= daysWindow) {
      return realData;
    }
    return realData.slice(-daysWindow);
  };

  /**
   * Returns { current, previous } where each is up to 30 days.
   * current = the most recent 30 days (rendered in chart).
   * previous = the 30 days before that (used only for trend calculation).
   */
  var getCostComparisonForCapability = (capabilityId) => {
    // Fetch 60 days of raw data internally so we can compute both windows,
    // but only the last 30 are ever passed to the chart.
    const rawAll: { name: string; pv: number }[] =
      query.isFetched && query.data != null && query.data.has(capabilityId)
        ? query.data.get(capabilityId)
        : useDummyData
          ? (() => {
            // Vary history length per capability so we can test partial-history behaviour:
            // ~⅓ get 60 days (full comparison), ~⅓ get 45 days, ~⅓ get 20 days.
            const bucket =
              capabilityId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 3;
            const dummyDays = bucket === 0 ? 60 : bucket === 1 ? 45 : 20;
            return generateDummyCosts(capabilityId, dummyDays);
          })()
          : [];

    const current = rawAll.slice(-30); // ← chart always shows exactly 30 days
    const previous = rawAll.length > 30 ? rawAll.slice(-60, -30) : [];
    const hasFullComparison = rawAll.length >= 60;
    return { current, previous, hasFullComparison };
  };

  return {
    query: query,
    getCostsForCapability: getCostsForCapability,
    getCostComparisonForCapability: getCostComparisonForCapability,
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

    if (query.data == null) {
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

    if (query.data == null) {
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
