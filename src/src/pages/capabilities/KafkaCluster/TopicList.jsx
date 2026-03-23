import React from "react";
import Topic from "./Topic";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";

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
    <div className="mt-4">
      <SectionLabel className="mb-1 block">{name}</SectionLabel>
      {sorted.length === 0 && (
        <EmptyState>No {name.toLocaleLowerCase()} topics…yet!</EmptyState>
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
    </div>
  );
}
