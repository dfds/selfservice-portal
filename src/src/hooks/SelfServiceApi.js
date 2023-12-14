import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useEffect, useState } from "react";
import { composeSegmentsUrl } from "Utils";
import { useError } from "./Error";
import { useTracking } from "./Tracking";

function isValidURL(urlString) {
  const urlRegex = /^(?:https?:\/\/)/;
  return urlRegex.test(urlString);
}

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export class PollUntilExpectedDataOptions {
  constructor() {
    this.sendRequest = () => {};
    this.responseData = {};
    this.condFunc = (responseData) => false;
    this.pollingInterval = 5000;
    this.pollingEnabled = false;
  }
}

/**
 * @param {PollUntilExpectedDataOptions} options
 */
export function usePollUntilExpectedData(options) {
  const [expectedDataDetected, setExpectedDataDetected] = useState(false);
  const [keepPolling, setkeepPolling] = useState(false);
  const [pollingId, setPollingId] = useState("");
  const [pollingEnabled, setPollingEnabled] = useState(options.pollingEnabled);
  const [internalOptions, setInternalOptions] = useState(options);

  /**
   * @param {PollUntilExpectedDataOptions} additionalOptions
   */
  const trigger = (additionalOptions) => {
    setInternalOptions((iop) => {
      return {
        ...iop,
        ...additionalOptions,
      };
    });
    setPollingEnabled(true);
  };

  useEffect(() => {
    const op = async () => {
      if (expectedDataDetected) {
        return;
      }

      if (internalOptions.condFunc(options.responseData)) {
        // console.log("condition met, stop polling");
        setExpectedDataDetected(true);
        setkeepPolling(false);
      } else {
        setkeepPolling(true);
      }
    };

    op();
  }, [options.responseData]); // Need to use options rather than internalOptions for responseData, won't get updated otherwise

  useEffect(() => {
    if (!pollingEnabled) {
      return;
    }
    // Setup polling
    if (keepPolling) {
      const id = setInterval(() => {
        const op = async () => {
          // Do another poll after x seconds
          internalOptions.sendRequest();
        };
        op();
      }, internalOptions.pollingInterval);
      setPollingId(id);
    } else {
      clearInterval(pollingId);
    }
  }, [keepPolling, pollingEnabled]);

  return {
    expectedDataDetected,
    triggerPolling: trigger,
  };
}

export function useSelfServiceRequest(errorParams) {
  const [responseData, setResponseData] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const { triggerErrorWithTitleAndDetails, setErrorOptions } = useError({
    ...errorParams,
  });
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
      const httpResponse = await callApi(url, accessToken, method, payload);
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
