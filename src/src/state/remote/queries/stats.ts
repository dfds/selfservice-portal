import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useStats() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["stats"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return query;
}

export function useTopVisitors(profileDefinition: any) {
  const visitorsLink = profileDefinition?._links?.topVisitors;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const query = useQuery({
    queryKey: ["topVisitors"],
    enabled: !!visitorsLink,
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [visitorsLink.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return query;
}
