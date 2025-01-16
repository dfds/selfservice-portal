import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import PreAppContext from "@/preAppContext";
import { useContext } from "react";

export function useKafkaClustersAccessList(capabilityDefinition) {
  const link = capabilityDefinition?._links?.clusters;
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: [
      "capabilities",
      "kafka",
      "clusters-list",
      capabilityDefinition?.id,
    ],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: [link.href],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => data.items,
    enabled: link != null,
  });

  return query;
}

export function useKafkaClusters() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["kafka", "clusters"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["kafkaclusters"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
    select: (data: any) => data.items,
  });

  return query;
}

export function usePublicTopics() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["public-kafkatopics"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["kafkatopics"],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
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

export function useUpdateKafkaTopic() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: data.topicDefinition?._links?.updateDescription.method,
        urlSegments: [data.topicDefinition?._links?.updateDescription.href],
        payload: data.payload,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useDeleteKafkaTopic() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "DELETE",
        urlSegments: [data.topicDefinition?._links?.self?.href],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useAddKafkaTopic() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.clusterDefinition?._links?.createTopic.href],
        payload: data.payload,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useRequestAccessToCluster() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [data.clusterDefinition?._links?.requestAccess.href],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}
