
import React, { createContext, useEffect, useContext, useState } from 'react';
import AppContext from "../../AppContext"

const TopicsContext = createContext();

function TopicsProvider({ children }) {
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const {selfServiceApiClient} = useContext(AppContext);

    useEffect(() => {
        fetchKafkaclusters().then(x => setKafkaClusters(x));
    }, []);

    const fetchKafkaclusters = async () => {
        const result = await selfServiceApiClient.getKafkaClusters();
            return result;
        }


    const toggleSelectedKafkaTopic = (kafkaTopicId) => {
        setSelectedKafkaTopic(prev => {
            if (prev === kafkaTopicId) {
                return null;
            }

            return kafkaTopicId;


        });
    };

    const state ={
        selectedKafkaTopic,
        toggleSelectedKafkaTopic
    }

    return <TopicsContext.Provider value={state}>{children}</TopicsContext.Provider>;
}

export {TopicsContext as default, TopicsProvider};

