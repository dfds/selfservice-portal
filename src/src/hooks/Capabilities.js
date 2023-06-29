import { useEffect, useState } from "react";
import { useSelfServiceApi } from "./SelfServiceApi";
import { getAnotherUserProfilePictureUrl } from "../GraphApiClient";


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

export function useCapabilityMembers(capabilityDefinition) {
    const { inProgress, data, errorMessage, sendRequest } = useSelfServiceApi();
    const [ isLoadedMembers, setIsLoadedMembers ] = useState(false);
    const [ membersList, setMembersList] = useState([]);


    const membersLink = capabilityDefinition?._links?.members;

    useEffect(() => {
        if (membersLink){
            sendRequest(membersLink.href);
        }

    }, [membersLink]);

    useEffect(() => {

        const updateMembers = async (members) => {
            if (members.length !== 0) {
              const updatedList = await Promise.all(
                members.map(async (member) => {
                  const profilePictureUrl = await getAnotherUserProfilePictureUrl(member.email);
                  const updatedMember = { ...member, pictureUrl: profilePictureUrl };
                  return updatedMember;
                })
              );
              setMembersList(updatedList);
            }
          };

        if (data?.items.length !== 0) {
            setMembersList(prev => {
                if(prev.length === 0){
                    return data?.items || [];
                }else {
                    return prev;
                }
            });

            updateMembers(data?.items || []);
        }
        
    }, [data]);

    useEffect(() => {
        if(membersList.length !== 0){
            setIsLoadedMembers(true);
        }
        
    }, [membersList]);
    

    return {
        isLoadedMembers,
        membersList,
    };
}




