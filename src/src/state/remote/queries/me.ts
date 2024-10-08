import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function useMe() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["me"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
  });

  return query;
}
