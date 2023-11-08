import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useContext, useEffect, useState } from "react";
import { composeUrl, composeSegmentsUrl } from "Utils";
import { useError } from "./Error";
import { NewErrorContextBuilder } from "misc/error";
import { useTracking } from "./Tracking";

function isValidURL(urlString) {
  const urlRegex = /^(?:https?:\/\/)/;
  return urlRegex.test(urlString);
}

export function useSelfServiceRequest(errorParams) {
  const [responseData, setResponseData] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const { triggerError, setErrorOptions } = useError({
    ...errorParams,
    msg: "Oh no! We had an issue while retrieving data from the api. Please reload the page.",
  });
  const { track } = useTracking();

  const sendRequest = async ({ urlSegments, method, payload }) => {
    setInProgress(true);

    console.log(urlSegments);
    console.log(payload);

    const accessToken = await getSelfServiceAccessToken();

    let url = composeSegmentsUrl(urlSegments);
    if (isValidURL(urlSegments[0])) {
      url = urlSegments[0];
      console.log(url);
    }

    track("selfservice", `${method}::${url}`, "1");

    try {
      const httpResponse = await callApi(url, accessToken, method, payload);

      if (httpResponse.ok) {
        const newData = await httpResponse.json();
        setResponseData(newData);
      } else {
        triggerError(
          NewErrorContextBuilder().setHttpResponse(httpResponse).build(),
        );
      }
    } catch (error) {
      triggerError(NewErrorContextBuilder().setMsg(error.message).build());
    } finally {
      setInProgress(false);
    }
  };

  return {
    inProgress,
    responseData,
    triggerError,
    setErrorOptions,
    sendRequest,
  };
}
