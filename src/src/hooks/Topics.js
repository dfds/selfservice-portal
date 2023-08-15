import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useTopics() {
  const { inProgress, responseData, sendRequest, setErrorOptions } =
    useSelfServiceRequest();
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
      console.log(finalTopics);
      setTopicsList(finalTopics);
      setIsLoaded(true);
    }
  }, [responseData]);

  return {
    isLoaded,
    topicsList,
  };
}
