import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

export function usePublicTopics() {
  const query = useQuery({
    queryKey: ["public-kafkatopics"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["public-kafkatopics"],
        payload: null,
        isCloudEngineerEnabled: true,
      }),
    select: (data: any) => {
      const finalTopics = (data.items || []).map((topic) => {
        const copy = { ...topic };
        const found = (data._embedded?.kafkaClusters?.items || []).find(
          (cluster) => cluster.id === topic.kafkaClusterId,
        );
        copy.kafkaClusterName = found?.name || "";
        return copy;
      });

      return finalTopics;
    },
  });

  return query;
}
