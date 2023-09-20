import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { NewErrorContextBuilder } from "../misc/error";
import {callApi, getSelfServiceAccessToken} from "../AuthService";

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
  const { triggerError, sendRequest } = useSelfServiceRequest();
  return (topicDefinition) => {
    const link = topicDefinition?._links?.self;
    if (!link) {
      triggerError(
        NewErrorContextBuilder()
          .setMsg(
            "Error! No topic self link found on topic definition: " +
              JSON.stringify(topicDefinition, null, 2),
          )
          .build(),
      );
      return;
    }

    if (!(link.allow || []).includes("DELETE")) {
      triggerError(
        NewErrorContextBuilder()
          .setMsg(
            "Error! You are not allowed to delete the topic. Options was " +
              JSON.stringify(link.allow, null, 2),
          )
          .build(),
      );
      return;
    }
    sendRequest({
      urlSegments: [link.href],
      method: "DELETE",
    });
  };
}

export function useUpdateTopic() {
  const { triggerError, sendRequest } = useSelfServiceRequest();
  return (topicDefinition, topicDescriptor) => {
    const link = topicDefinition?._links?.updateDescription;
    if (!link) {
      triggerError(
        NewErrorContextBuilder().setMsg(
          "Error! No update topic description link found on topic definition: " +
            JSON.stringify(topicDefinition, null, 2),
        ),
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

export function useGetTopics() {
  const { responseData, sendRequest } = useSelfServiceRequest();

  const getTopics = async (clusterAccessDefinition) => {
    const topicsLink = clusterAccessDefinition?._links?.topics;
    if (!topicsLink) {
      console.log(
        "Warning! No topics link found on kafka cluster access definition:",
        clusterAccessDefinition,
      );
      return [];
    }
    await sendRequest({
      urlSegments: [topicsLink.href],
      method: topicsLink.method,
    });
    return responseData.data;
  };

  return {
    getTopics,
  };
}

export function useGetMessageContracts() {
  const { responseData, sendRequest } = useSelfServiceRequest();
  return async (topicDefinition) => {
    const messageContractsLink = topicDefinition?._links?.messageContracts;
    await sendRequest({
      urlSegments: [messageContractsLink.href],
      method: messageContractsLink.method,
    });
    return responseData.data;
  };
}

export function useGetConsumers(){
  const { responseData, sendRequest } = useSelfServiceRequest();
  return async (topicDefinition) =>  {
    const link = topicDefinition?._links?.consumers;

    if (!link) {
      return [];
    }
    // If we are _not_ allowed to get consumers, simply return nothing
    if (!(link.allow || []).includes("GET")) {
      return [];
    }
    await sendRequest(
    {
      urlSegments: [link.href],
    });
    return responseData.data.items
  }
}
