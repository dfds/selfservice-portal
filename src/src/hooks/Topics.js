import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { NewErrorContextBuilder } from "../misc/error";

export function useTopics() {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoaded, setIsLoaded] = useState(false);
  const [topicsList, setTopicsList] = useState([]);

  useEffect(() => {
    sendRequest({
      urlSegments: ["kafkatopics"],
      method: "GET",
      payload: null,
    });
  }, []);

  useEffect(() => {
    if (responseData != null) {
      const finalTopics = (responseData.items || []).map((topic) => {
        const copy = { ...topic };
        const found = (responseData._embedded?.kafkaClusters?.items || []).find(
          (cluster) => cluster.id === topic.kafkaClusterId,
        );
        copy.kafkaClusterName = found?.name || "";
        return copy;
      });
      setTopicsList(finalTopics);
      setIsLoaded(true);
    }
  }, [responseData]);

  return {
    isLoaded,
    topicsList,
  };
}

export function useDeleteTopic() {
  const { triggerErrorWithTitleAndDetails, sendRequest } =
    useSelfServiceRequest();
  const deleteTopic = (topicDefinition) => {
    const link = topicDefinition?._links?.self;
    if (!link) {
      triggerErrorWithTitleAndDetails(
        "Error",
        "No topic self link found on topic definition: " +
          JSON.stringify(topicDefinition, null, 2),
      );
      return;
    }

    if (!(link.allow || []).includes("DELETE")) {
      triggerErrorWithTitleAndDetails(
        "Error",
        "You are not allowed to delete the topic. Options was " +
          JSON.stringify(link.allow, null, 2),
      );
      return;
    }
    sendRequest({
      urlSegments: [link.href],
      method: "DELETE",
    });
  };
  return {
    deleteTopic,
  };
}

export function useUpdateTopic() {
  const { triggerErrorWithTitleAndDetails, sendRequest } =
    useSelfServiceRequest();
  return (topicDefinition, topicDescriptor) => {
    const link = topicDefinition?._links?.updateDescription;
    if (!link) {
      triggerErrorWithTitleAndDetails(
        "Error",
        "No update topic description link found on topic definition: " +
          JSON.stringify(topicDefinition, null, 2),
      );
    }

    sendRequest({
      urlSegments: [link.href],
      method: link.method,
      payload: {
        ...topicDescriptor,
      },
    });
  };
}
