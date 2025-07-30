import React from "react";
import { TrackedLink } from "../Tracking";

export default function ConsumerLink({ capabilityId, topicName, linkTitle }) {
  return (
    <TrackedLink
      trackName="ConsumerLink"
      href={`https://view.grafana.dfds.cloud/d/mihl5sn/topic-consumers?orgId=1&from=now-30d&to=now&timezone=browser&var-prefix=.%2A&var-namespace=${capabilityId}&var-topic=${topicName}`}
    >
      {linkTitle}
    </TrackedLink>
  );
}
