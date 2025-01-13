import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useStats() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
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

export function useTopVisitors(profileDefinition: any) {
  const visitorsLink = profileDefinition?._links?.topVisitors;
  const { isEnabledCloudEngineer } = useContext(PreAppContext);

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
