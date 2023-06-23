import { useEffect, useState } from "react";
import { useSelfServiceApi } from "./SelfServiceApi";

export function useCapabilities() {
    const { inProgress, data, errorMessage, sendRequest } = useSelfServiceApi();

    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ capabilities, setCapabilities] = useState([]);
    
    useEffect(() => {
        sendRequest("capabilities");
    }, []);

    useEffect(() => {
        setCapabilities(data?.items || []);
        setIsLoaded(true);
    }, [data]);

    return {
        isLoaded,
        capabilities,
    };
}