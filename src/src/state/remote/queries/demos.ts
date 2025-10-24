import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

export function useDemoSignups() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["demosignups"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["demos/signups"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => {
      let list = data.items || [];
      return list;
    },
  });

  return query;
}
