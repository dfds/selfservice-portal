import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useStats(isEnabledCloudEngineer: boolean) {
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["stats"],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return query;
}

export function useTopVisitors(
  profileDefinition: any,
  isEnabledCloudEngineer: boolean,
) {
  const visitorsLink = profileDefinition?._links?.topVisitors;

  const query = useQuery({
    queryKey: ["topVisitors"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [visitorsLink.href],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return query;
}
