
import React, { createContext, useEffect, useCallback, useContext, useState } from 'react';
import AppContext from "../../AppContext"

const TopicsContext = createContext();

function TopicsProvider({ children }) {
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const {selfServiceApiClient} = useContext(AppContext);
    


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

