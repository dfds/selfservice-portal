import React from "react";
import { TrackedButton } from "../Tracking";

export default function ConsumerLink({ capabilityId, topicName, linkTitle }) {
  return (
    <TrackedButton
      trackName="ConsumerLink"
      onClick={() =>
        window.open(
          `https://view.grafana.dfds.cloud/d/mihl5sn/topic-consumers?orgId=1&from=now-30d&to=now&timezone=browser&var-prefix=.%2A&var-namespace=${capabilityId}&var-topic=${topicName}`,
          "_blank",
          "noopener,noreferrer",
        )
      }
    >
      {linkTitle}
    </TrackedButton>
  );
}
