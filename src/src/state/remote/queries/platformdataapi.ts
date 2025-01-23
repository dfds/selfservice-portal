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
