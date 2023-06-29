import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useContext, useEffect, useState } from "react";
import { composeUrl, composeUrl2 } from "Utils";
import ErrorContext from "ErrorContext";



function isValidURL(urlString) {
    const urlRegex = /^(?:https?:\/\/)/;
    return urlRegex.test(urlString);
  }

export function useSelfServiceRequest() {
    const { showError } =  useContext(ErrorContext);
    const [errorMessage, setErrorMessage] = useState("");
    const [responseData, setResponseData] = useState(null);
    const [inProgress, setInProgress] = useState(false);

    const sendRequest = async ({ urlSegments, method, payload }) => {
        setInProgress(true);

        const accessToken = await getSelfServiceAccessToken();

        let url = composeUrl2(urlSegments);
        console.log("segmets: ", urlSegments);
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
                if (httpResponse.headers.get("Content-Type") === "application/problem+json") {
                    const { detail } = await httpResponse.json();
                    setErrorMessage(detail);
                } else {
                    setErrorMessage("Oh no! We had an issue while retrieving capabilities from the api. Please reload the page.");
                }
            }
        } catch (error) {
            setErrorMessage(error.message);
            console.log(error.message);
        } finally {
            setInProgress(false);
        }
    };

    useEffect(() => {
    if (errorMessage != "") {
        showError(errorMessage);
    }        
    }, [errorMessage]);

    return {
        inProgress,
        responseData,
        errorMessage,
        sendRequest
    };
}