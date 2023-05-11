
import { getKafkaClusters } from "./../../SelfServiceApiClient";
import React, { createContext, useEffect, useCallback, useContext, useState } from 'react';

const TopicsContext = createContext();

function TopicsProvider({ children }) {
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [kafkaClusters, setKafkaClusters] = useState([]);

    useEffect(() => {
        fetchKafkaclusters().then(x => setKafkaClusters(x));
    }, []);

    const fetchKafkaclusters = async () => {
        const result = await getKafkaClusters();
            return result;
        }


    const toggleSelectedKafkaTopic = (kafkaTopicId) => {
        setSelectedKafkaTopic(prev => {
            if (prev == kafkaTopicId) {
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

