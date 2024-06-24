import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useContext, useState } from "react";
import { composeSegmentsUrl } from "Utils";
import { useError } from "./Error";
import { useTracking } from "./Tracking";
import PreAppContext from "../preAppContext";

function isValidURL(urlString) {
  const urlRegex = /^(?:https?:\/\/)/;
  return urlRegex.test(urlString);
}

export function useSelfServiceRequest(errorParams) {
  const [responseData, setResponseData] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const { triggerErrorWithTitleAndDetails, setErrorOptions } = useError({
    ...errorParams,
  });

  const { falseUserPermissions } = useContext(PreAppContext);

  const { track } = useTracking();

  const httpResponseToErrorMessage = (httpResponse) => {
    return `Got ${httpResponse.status}: "${httpResponse.statusText}" for ${httpResponse.url}`;
  };

  const sendRequest = async ({ urlSegments, method, payload }) => {
    setInProgress(true);

    const accessToken = await getSelfServiceAccessToken();

    let url = composeSegmentsUrl(urlSegments);
    if (isValidURL(urlSegments[0])) {
      url = urlSegments[0];
    }

    track("selfservice", `${method}::${url}`, "1");

    try {
      const httpResponse = await callApi(
        url,
        accessToken,
        method,
        payload,
        falseUserPermissions,
      );
      if (httpResponse.ok) {
        const contentType = httpResponse.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          setResponseData(await httpResponse.json());
        }
      } else {
        const newData = await httpResponse.json();
        const errorTitle = newData.title;
        const errorDetails = newData.detail;
        const httpError = httpResponseToErrorMessage(httpResponse);
        if (errorDetails && errorTitle) {
          const problemDetailsWithHttpError = errorDetails + "\n\n" + httpError;
          triggerErrorWithTitleAndDetails(
            errorTitle,
            problemDetailsWithHttpError,
          );
        } else {
          triggerErrorWithTitleAndDetails("Http Error", httpError);
        }
      }
    } catch (error) {
      const actualMethod = method || "GET";
      const errorDetails = `Error when calling ${actualMethod} ${url}:\n${error}`;
      triggerErrorWithTitleAndDetails("Http Error", errorDetails);
    } finally {
      setInProgress(false);
    }
  };

  return {
    inProgress,
    responseData,
    triggerErrorWithTitleAndDetails,
    setErrorOptions,
    sendRequest,
  };
}
