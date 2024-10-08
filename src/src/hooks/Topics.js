import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useDeleteTopic() {
  const { triggerErrorWithTitleAndDetails, sendRequest } =
    useSelfServiceRequest();
  const deleteTopic = (topicDefinition) => {
    const link = topicDefinition?._links?.self;
    if (!link) {
      triggerErrorWithTitleAndDetails(
        "Delete topic failed",
        "No topic self link found on topic definition:\n" +
          JSON.stringify(topicDefinition, null, 2),
      );
      return;
    }

    if (!(link.allow || []).includes("DELETE")) {
      triggerErrorWithTitleAndDetails(
        "Delete topic failed",
        "You are not allowed to delete the topic. Options are\n" +
          JSON.stringify(link.allow, null, 2),
      );
      return;
    }
    sendRequest({
      urlSegments: [link.href],
      method: "DELETE",
    });
  };
  return {
    deleteTopic,
  };
}

export function useUpdateTopic() {
  const { triggerErrorWithTitleAndDetails, sendRequest } =
    useSelfServiceRequest();
  const updateTopic = (topicDefinition, topicDescriptor) => {
    const link = topicDefinition?._links?.updateDescription;
    if (!link) {
      triggerErrorWithTitleAndDetails(
        "Update topic failed",
        "No update topic description link found on topic definition: " +
          JSON.stringify(topicDefinition, null, 2),
      );
    }

    sendRequest({
      urlSegments: [link.href],
      method: link.method,
      payload: {
        ...topicDescriptor,
      },
    });
  };
  return { updateTopic };
}
