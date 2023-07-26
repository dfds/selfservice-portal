import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useContext, useEffect, useState } from "react";
import { composeUrl, composeSegmentsUrl } from "Utils";
import { useError } from "./Error";
import { NewErrorTriggerRequestBuilder } from "misc/error";



function isValidURL(urlString) {
    const urlRegex = /^(?:https?:\/\/)/;
    return urlRegex.test(urlString);
  }

export function useSelfServiceRequest() {
    const [responseData, setResponseData] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const {triggerError, setErrorOptions} = useError({
      msg: "Oh no! We had an issue while retrieving data from the api. Please reload the page."
    });

    const sendRequest = async ({ urlSegments, method, payload }) => {
        setInProgress(true);

        const accessToken = await getSelfServiceAccessToken();

        let url = composeSegmentsUrl(urlSegments);
        if (isValidURL(urlSegments[0]))
        {
            url = urlSegments[0];
        }

        try {
            const httpResponse = await callApi(url, accessToken, method, payload);

            if (httpResponse.ok) {
                const newData = await httpResponse.json();
                setResponseData(newData);
            } else {
                triggerError(NewErrorTriggerRequestBuilder()
                  .setHttpResponse(httpResponse)
                  // .setHandler((params) => {
                  //   if (params.httpResponse.headers.get("Content-Type") === "application/problem+json") {
                  //       const { detail } = await httpResponse.json();
                  //       setErrorMessage(detail);
                  //   } else {
                  //       setErrorMessage("Oh no! We had an issue while retrieving data from the api. Please reload the page.");
                  //   }
                  // })
                  .build());

            }
        } catch (error) {
            triggerError(NewErrorTriggerRequestBuilder()
              .setMsg(error.message)
              .build());
        } finally {
            setInProgress(false);
        }
    };

    return {
        inProgress,
        responseData,
        triggerError,
        setErrorOptions,
        sendRequest
    };
}