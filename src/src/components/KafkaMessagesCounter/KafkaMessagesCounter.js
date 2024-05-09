import React, { useContext }  from "react";
import AppContext from "AppContext";
import { Text } from "@dfds-ui/typography";

import { kafkaStore } from "../../mobx/KafkaMessagesStore";
import { observer } from "mobx-react-lite"



const  KafkaMessagesCounter = observer(() => {
 
    return (
      <>
        <Text>Total Kafka Messages For Today: {kafkaStore.count}</Text>
      </>
    );
  }
); 

export default KafkaMessagesCounter;