import React from "react";
import KafkaCluster from "pages/capabilities/KafkaCluster";


import { observer } from "mobx-react-lite"

import { store} from "./store"

const KafkaClusters = observer(({capabilityId}) => {
    return (
        <>
          {(store.topics || []).map((cluster) => (
            <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={capabilityId} />
          ))}
        </>
      );
}); 

export default KafkaClusters;
   

    
  
