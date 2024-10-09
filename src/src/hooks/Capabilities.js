import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useGetUrlData(link) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState(null);

  const shouldGet = (link?.allow || []).includes("GET");

  useEffect(() => {
    if (link && shouldGet) {
      sendRequest({
        urlSegments: [link.href],
      });
    }
  }, [link]);

  useEffect(() => {
    if (responseData !== null) {
      setData(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (data !== null) {
      setIsLoaded(true);
    }
  }, [data]);

  return {
    isLoaded,
    data,
  };
}

export function useCapabilityMetadata(capabilityDefinition) {
  const { responseData, sendRequest: sendGetJsonMetadataRequest } =
    useSelfServiceRequest();
  const { sendRequest: sendSetJsonMetadataRequest } = useSelfServiceRequest();
  const {
    inProgress: inProgressMetadata,
    sendRequest: sendSetRequiredCapabilityJsonMetadata,
  } = useSelfServiceRequest();
  const [isLoadedMetadata, setIsLoadedMetadata] = useState(false);
  const [metadata, setMetadata] = useState(null);

  const link = capabilityDefinition?._links;

  const getMetaData = async () => {
    if (link?.metadata && (link.metadata.allow || []).includes("GET")) {
      sendGetJsonMetadataRequest({
        urlSegments: [link.metadata.href],
        method: "GET",
      });
    }
  };

  useEffect(() => {
    getMetaData();
  }, [link]);

  useEffect(() => {
    if (responseData !== null) {
      setMetadata(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (metadata !== null) {
      setIsLoadedMetadata(true);
    }
  }, [metadata]);

  const setCapabilityJsonMetadata = async (jsonMetadata) => {
    if (!(link?.metadata && (link.metadata.allow || []).includes("POST"))) {
      throw new Error("User is not allowed to set metadata");
    }
    await sendSetJsonMetadataRequest({
      urlSegments: [link.metadata.href],
      method: "POST",
      payload: {
        jsonMetadata: jsonMetadata,
      },
    });
    getMetaData();
  };

  const setRequiredCapabilityJsonMetadata = async (jsonMetadata) => {
    if (
      !(
        link?.setRequiredMetadata &&
        (link.setRequiredMetadata.allow || []).includes("POST")
      )
    ) {
      throw new Error("User is not allowed to set required metadata");
    }
    await sendSetRequiredCapabilityJsonMetadata({
      urlSegments: [link?.setRequiredMetadata.href],
      method: "POST",
      payload: {
        jsonMetadata: JSON.parse(jsonMetadata),
      },
    });
    getMetaData();
  };

  return {
    isLoadedMetadata,
    metadata,
    setCapabilityJsonMetadata,
    setRequiredCapabilityJsonMetadata,
    inProgressMetadata,
  };
}
