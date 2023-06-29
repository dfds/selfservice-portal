import { callApi, getSelfServiceAccessToken } from "AuthService";
import { useContext, useEffect, useState } from "react";
import { composeUrl } from "Utils";
import ErrorContext from "ErrorContext";



function isValidURL(urlString) {
    const urlRegex = /^(?:https?:\/\/)/;
    return urlRegex.test(urlString);
  }

export function useSelfServiceApi() {
    const { showError } =  useContext(ErrorContext);
    const [errorMessage, setErrorMessage] = useState("");
    const [data, setData] = useState(null);
    const [inProgress, setInProgress] = useState(false);

    const sendRequest = async (...urlSegments) => {
        setInProgress(true);

        let url = composeUrl(...urlSegments);

        const accessToken = await getSelfServiceAccessToken();

        if (isValidURL(urlSegments))
        {
            url = urlSegments;
        }

        try {
            const response = await callApi(url, accessToken);
            

            if (response.ok) {
                const newData = await response.json();
                
                setData(newData);
            } else {
                if (response.headers.get("Content-Type") === "application/problem+json") {
                    const { detail } = await response.json();
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
        data,
        errorMessage,
        sendRequest
    };
}