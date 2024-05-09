import React, { useContext }  from "react";
import AppContext from "AppContext";
import { Text } from "@dfds-ui/typography";



export default function KafkaMessagesCounter() {

const {kafkaCount} = useContext(AppContext);
 

  return (
    <>
      <Text>Total Kafka Messages For Today: {kafkaCount}</Text>
    </>
  );
}