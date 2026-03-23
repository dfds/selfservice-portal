import {
  createSsuQuery,
  createSsuParamQuery,
  createSsuLinkQuery,
  createSsuMutation,
} from "../queryFactory";

function enrichTopicsWithClusterName(data: any): any[] {
  return (data.items || []).map((topic: any) => {
    const found = (data._embedded?.kafkaClusters?.items || []).find(
      (cluster: any) => cluster.id === topic.kafkaClusterId,
    );
    return { ...topic, kafkaClusterName: found?.name || "" };
  });
}

export const useKafkaClustersAccessList = createSsuLinkQuery<any>({
  queryKey: (def) => [
    "capabilities",
    "kafka",
    "clusters-list",
    def?.id,
  ],
  linkHref: (def) => def?._links?.clusters?.href,
  select: (data: any) => data.items,
});

export const useKafkaClusters = createSsuQuery({
  queryKey: ["kafka", "clusters"],
  urlSegments: ["kafkaclusters"],
  select: (data: any) => data.items,
});

export const usePublicTopics = createSsuQuery({
  queryKey: ["public-kafkatopics"],
  urlSegments: ["kafkatopics"],
  select: enrichTopicsWithClusterName,
});

export const useUpdateKafkaTopic = createSsuMutation<any>({
  method: (data) => data.topicDefinition?._links?.updateDescription.method,
  urlSegments: (data) => [
    data.topicDefinition?._links?.updateDescription.href,
  ],
});

export const useDeleteKafkaTopic = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => [data.topicDefinition?._links?.self?.href],
  payload: () => null,
});

export const useAddKafkaTopic = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.clusterDefinition?._links?.createTopic.href,
  ],
});

export const useAllKafkaTopics = createSsuQuery({
  queryKey: ["kafka", "all-topics"],
  urlSegments: ["kafkatopics"],
  authMode: true,
  select: enrichTopicsWithClusterName,
});

export const useTopicMessageContracts = createSsuParamQuery<string>({
  queryKey: (topicId) => ["kafka", "topic-message-contracts", topicId],
  urlSegments: (topicId) => ["kafkatopics", topicId, "messagecontracts"],
  authMode: true,
  enabled: (id) => !!id,
  select: (data: any) => data.items || [],
});

export const useKafkaSchemas = createSsuParamQuery<string>({
  queryKey: (clusterId) => ["kafka", "schemas", clusterId],
  urlSegments: (clusterId) => ["kafkaschemas", clusterId],
  authMode: true,
  enabled: (id) => !!id,
});

export const useRequestAccessToCluster = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    data.clusterDefinition?._links?.requestAccess.href,
  ],
  payload: () => null,
});
