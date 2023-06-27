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


export function useCapabilityById(id) {
    const { inProgress, data, errorMessage, sendRequest } = useSelfServiceApi();
    const [ isLoaded, setIsLoaded ] = useState(false);
    const [ capability, setCapability] = useState(null);
    
    useEffect(() => {
        if (id != null){
            sendRequest("capabilities", id);
        };
    }, [id]);

    useEffect(() => {
        if (data != null){
            setCapability(data);
            setIsLoaded(true);
        }            
    }, [data]);

    return {
        isLoaded,
        capability,
    };
}