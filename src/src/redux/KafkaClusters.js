import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './CounterSlice'
import KafkaCluster from "pages/capabilities/KafkaCluster";
import {
    updateSelectedTopic,
  } from "./capabilityState";

export default function KafkaClusters(capabilityId) {
    const clusters = useSelector(state => state.selectedCapability.topics)
    const dispatch = useDispatch();

    return (
      <>
        {(clusters || []).map((cluster) => (
          <KafkaCluster key={cluster.id} cluster={cluster} capabilityId={capabilityId} />
        ))}
      </>
    );
  }

  