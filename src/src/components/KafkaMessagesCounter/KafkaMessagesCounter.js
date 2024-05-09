import React, { useContext }  from "react";
import AppContext from "AppContext";
import { Text } from "@dfds-ui/typography";
import { useSelector, useDispatch } from "react-redux";

export default function KafkaMessagesCounter() {

// const {kafkaCount} = useContext(AppContext);

const kafkaCount = useSelector((state) => state.kafkaCounter.counter)
 

  return (
    <>
      <Text>Total Kafka Messages For Today: {kafkaCount}</Text>
    </>
  );
}