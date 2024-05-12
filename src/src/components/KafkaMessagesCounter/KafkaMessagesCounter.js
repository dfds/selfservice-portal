import React, { useContext, useEffect } from "react";
import KafkaMessagesContext from "KafkaMessagesContext";
import { Text } from "@dfds-ui/typography";

export default function KafkaMessagesCounter() {
  const { kafkaCount, updateCounter } = useContext(KafkaMessagesContext);

  useEffect(() => {
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    // updateCounter();
    updateCounter();
  }, []);

  return (
    <>
      <Text>Total Kafka Messages For Today: {kafkaCount}</Text>
    </>
  );
}
