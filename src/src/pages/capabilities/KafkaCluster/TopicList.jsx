import React from "react";
import { Text } from "@/components/dfds-ui/typography";
import Topic from "./Topic";
import { Divider } from "@dfds-ui/react-components/divider";

export default function TopicList({
  name,
  topics,
  clusterId,
  selectedTopic,
  onTopicClicked,
  schemas,
}) {
  let sorted = [...topics];
  sorted.sort((a, b) => a.name.localeCompare(b.name));

  const handleTopicClicked = (topicId) => {
    if (onTopicClicked) {
      onTopicClicked(clusterId, topicId);
    }
  };

  return (
    <>
      <Text styledAs="action">{name}</Text>
      <Divider />
      {sorted.length === 0 && (
        <div
          style={{ paddingLeft: "1rem", fontStyle: "italic", color: "#ccc" }}
        >
          No {name.toLocaleLowerCase()} topics...yet!
        </div>
      )}

      {sorted.map((topic) => (
        <Topic
          key={`${clusterId}-${topic.id}`}
          topic={topic}
          isSelected={
            clusterId === selectedTopic?.kafkaClusterId &&
            topic.id === selectedTopic?.id
          }
          onHeaderClicked={handleTopicClicked}
          schemas={schemas}
        />
      ))}
    </>
  );
}
