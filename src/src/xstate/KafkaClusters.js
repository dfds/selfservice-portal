import React from "react";
import KafkaCluster from "pages/capabilities/KafkaCluster";

import { CounterMachineContext } from "../index";

export default function KafkaClusters(capabilityId) {
    const topics = CounterMachineContext.useSelector((state) => state.context.topic);

    
    return (
      <>
        {(topics || []).map((cluster) => (
          <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={capabilityId} />
        ))}
      </>
    );
  }
