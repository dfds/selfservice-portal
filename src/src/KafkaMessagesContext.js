import React, { useState, useEffect, useContext, useMemo } from "react";

const KafkaMessagesCounterContext = React.createContext(null);

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

function KafkaMessagesCounterProvider({ children }) {
  const [kafkaCount, setKafkaCount] = useState(0);

  async function updateCounter() {
    sleep(1000).then(() => {
      setKafkaCount((prev) => prev + 1);
      updateCounter();
    });
  }

  const state = {
    kafkaCount,
    updateCounter,
  };

  return (
    <KafkaMessagesCounterContext.Provider value={state}>
      {children}
    </KafkaMessagesCounterContext.Provider>
  );
}

export { KafkaMessagesCounterContext as default, KafkaMessagesCounterProvider };
