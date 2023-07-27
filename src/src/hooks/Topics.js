import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";



export function useTopics() {
    // in this file too, maybe we want to handle the error message from useSelfServiceRequest()?
    const { responseData, sendRequest } = useSelfServiceRequest();
    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ topicsList, setTopicsList] = useState([]);

    useEffect(() => {
        sendRequest({
            urlSegments: ["kafkatopics"],
            method: "GET",
            payload: null
        });
    }, []);

    useEffect(() => {
        if(responseData != null){
            const finalTopics = (responseData.items || []).map(topic => {
                const copy = {...topic};
                const found = (responseData._embedded?.kafkaClusters?.items || []).find(cluster => cluster.id === topic.kafkaClusterId);
                copy.kafkaClusterName = found?.name || "";
                return copy;
            })
            console.log(finalTopics);
            setTopicsList(finalTopics);
            setIsLoaded(true);
        }

    }, [responseData]);

    return {
        isLoaded,
        topicsList
    }
}