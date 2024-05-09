import React, { useContext } from "react";
import AppContext from "AppContext";
import { Text } from "@dfds-ui/typography";

import { KafkaMachineContext } from "../../index";

export default function KafkaMessagesCounter() {
  const kafkacount = KafkaMachineContext.useSelector((state) => state.context.count);

  return (
    <>
      <Text>Total Kafka Messages For Today: {kafkacount}</Text>
    </>
  );
}
