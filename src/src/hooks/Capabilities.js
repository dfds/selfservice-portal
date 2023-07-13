import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { getAnotherUserProfilePictureUrl } from "../GraphApiClient";


export function useCapabilities() {
    const { inProgress, responseData: getAllResponse, errorMessage, sendRequest } = useSelfServiceRequest();
    const { responseData: addedCapability, sendRequest: addCapability } = useSelfServiceRequest();
    const [isLoaded, setIsLoaded] = useState(false);
    const [capabilities, setCapabilities] = useState([]);

    const sortByName = (list) => {
        list.sort((a, b) => a.name.localeCompare(b.name));
    };

    const createCapability = (name, description) => {
        addCapability({
            urlSegments: ["capabilities"],
            method: "POST",
            payload: {
                name: name,
                description: description,
            }
        });
    };

    useEffect(() => {
        if (addedCapability) {
            setCapabilities(prev => {
                const list = [...prev, addCapability];
                sortByName(list);
                return list;
            });
        }
    }, [addedCapability]);

    useEffect(() => {
        sendRequest({
            urlSegments: ["capabilities"],
            method: "GET",
            payload: null
        });
    }, []);

    useEffect(() => {
        const list = getAllResponse?.items || [];
        sortByName(list);

        setCapabilities(list);
        setIsLoaded(true);
    }, [getAllResponse]);

    return {
        isLoaded,
        capabilities,
        addCapability: createCapability,
    };
}

export function useCapabilityById(id) {
    const { inProgress, responseData, errorMessage, sendRequest } = useSelfServiceRequest();
    const [isLoaded, setIsLoaded] = useState(false);
    const [capability, setCapability] = useState(null);

    useEffect(() => {
        if (id != null) {
            sendRequest({
                urlSegments: ["capabilities", id]
            });
        };
    }, [id]);

    useEffect(() => {
        if (responseData != null) {
            setCapability(responseData);
            setIsLoaded(true);
        }
    }, [responseData]);

    return {
        isLoaded,
        capability,
    };
}

export function useCapabilityMembers(capabilityDefinition) {
    const { inProgress, responseData, errorMessage, sendRequest } = useSelfServiceRequest();
    const [isLoadedMembers, setIsLoadedMembers] = useState(false);
    const [membersList, setMembersList] = useState([]);

    const membersLink = capabilityDefinition?._links?.members;

    useEffect(() => {
        if (membersLink) {
            sendRequest({
                urlSegments: [membersLink.href]
            });
        }

    }, [membersLink]);

    useEffect(() => {

        if (responseData === null) {
            return
        }

        if (responseData?.items.length !== 0) {

            setMembersList(prev => {
                if (prev.length === 0) {
                    return responseData?.items || [];
                } else {
                    return prev;
                }
            });

            const result = updateUserWithProfilePicture(responseData?.items || []).then(data => {
                setMembersList(data);
            });

        }

    }, [responseData]);

    useEffect(() => {
        if (membersList.length !== 0) {
            setIsLoadedMembers(true);
        }

    }, [membersList]);


    return {
        isLoadedMembers,
        membersList,
    };
}


export function useCapabilityMembershipApplications(capabilityDefinition) {
    const { inProgress, responseData, errorMessage, sendRequest } = useSelfServiceRequest();
    const [isLoadedApplications, setIsLoadedApplications] = useState(false);
    const [applicationList, setApplicationList] = useState([]);

    const membershipApplicationsLink = capabilityDefinition?._links?.membershipApplications;



    useEffect(() => {
        if (membershipApplicationsLink) {
            sendRequest({
                urlSegments: [membershipApplicationsLink.href]
            });
        }

    }, [membershipApplicationsLink]);

    useEffect(() => {

        if (responseData === null) {
            return
        }


        if (responseData?.items.length !== 0) {
            setApplicationList(prev => {
                if (prev.length === 0) {
                    return responseData?.items || [];
                } else {
                    return prev;
                }
            });

            const result = updateUserWithProfilePicture(responseData?.items || []).then(data => {
                setApplicationList(data);
            });
        }

    }, [responseData]);

    useEffect(() => {
        if (applicationList.length !== 0) {
            setIsLoadedApplications(true);
        }

    }, [applicationList]);


    return {
        isLoadedApplications,
        applicationList,
    };
}


export function useCapabilityAwsAccount(capabilityDefinition) {
    const { inProgress, responseData, errorMessage, sendRequest } = useSelfServiceRequest();
    const [isLoadedAwsAccount, setIsLoadedAwsAccount] = useState(false);
    const [awsAccountList, setAwsAccountList] = useState({});

    const awsAccountLink = capabilityDefinition?._links?.awsAccount;

    useEffect(() => {
        if (awsAccountLink) {
            sendRequest({
                urlSegments: [awsAccountLink.href]
            });
        }
    }, [awsAccountLink]);

    useEffect(() => {

        if (responseData) {
            setAwsAccountList(responseData);
        }
    }, [responseData]);

    useEffect(() => {
        if (awsAccountList.length !== 0) {
            setIsLoadedAwsAccount(true);
        }
    }, [awsAccountList]);

    return {
        isLoadedAwsAccount,
        awsAccountList
    }

}


async function updateUserWithProfilePicture(users) {
    if (users.length !== 0) {
        const updatedList = await Promise.all(
            users.map(async (member) => {
                let profilePictureUrl = await getAnotherUserProfilePictureUrl(member.email);
                let updatedMember = { ...member, pictureUrl: profilePictureUrl };

                if (member.applicant) {
                    profilePictureUrl = await getAnotherUserProfilePictureUrl(member.applicant);
                    updatedMember = { ...member, applicantProfilePictureUrl: profilePictureUrl };

                }
                return updatedMember;
            })
        );
        return updatedList;
    }

    return [];
};









