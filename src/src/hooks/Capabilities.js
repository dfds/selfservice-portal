import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { getAnotherUserProfilePictureUrl } from "../GraphApiClient";

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
