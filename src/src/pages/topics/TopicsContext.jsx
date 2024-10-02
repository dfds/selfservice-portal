import React, { createContext, useState } from "react";

const TopicsContext = createContext();

function TopicsProvider({ children }) {
  const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);

  const toggleSelectedKafkaTopic = (kafkaTopicId) => {
    setSelectedKafkaTopic((prev) => {
      if (prev === kafkaTopicId) {
        return null;
      }

      return kafkaTopicId;
    });
  };

  const state = {
    selectedKafkaTopic,
    toggleSelectedKafkaTopic,
  };

  return (
    <TopicsContext.Provider value={state}>{children}</TopicsContext.Provider>
  );
}

export { TopicsContext as default, TopicsProvider };
