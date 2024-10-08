import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

const sortByName = (list) => {
  list.sort((a, b) => a.name.localeCompare(b.name));
};

export function useCapabilities() {
  const query = useQuery({
    queryKey: ["capabilities"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => {
      let list = data.items || [];
      sortByName(list);
      return list;
    },
  });

  return query;
}
