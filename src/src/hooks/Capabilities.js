import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { getAnotherUserProfilePictureUrl } from "../GraphApiClient";
import { set } from "date-fns";

export function useCapabilities() {
  // const { errorMessage } = useSelfServiceRequest();
  // ^to remind that useSelfServiceRequest() also returns an errorMessage, we might want to not ignore it someday
  const { responseData: getAllResponse, sendRequest } = useSelfServiceRequest();
  const { responseData: addedCapability, sendRequest: addCapability } =
    useSelfServiceRequest();
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
      },
    });
  };

  useEffect(() => {
    if (addedCapability) {
      setCapabilities((prev) => {
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
      payload: null,
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [capability, setCapability] = useState(null);
  const [reloadRequired, setReloadRequired] = useState(true);
  const { inProgress, responseData, setErrorOptions, sendRequest } =
    useSelfServiceRequest({
      handler: (params) => {
        if (params.error) {
          params.showError(params.error.message);
          return;
        }

        if (params.httpResponse) {
          if (params.httpResponse.status === 404) {
            params.showError("Capability not found");
            return;
          }

          params.showError(params.httpResponse.statusText);
          return;
        }

        params.showError(params.msg);
      },
    });

  useEffect(() => {
    if (id != null && reloadRequired) {
      sendRequest({
        urlSegments: ["capabilities", id],
      });
    }
  }, [id, reloadRequired]);

  useEffect(() => {
    if (responseData != null) {
      setCapability(responseData);
      setIsLoaded(true);
      setReloadRequired(false);
    }
  }, [responseData]);

  return {
    isLoaded,
    capability,
    setReloadRequired,
  };
}

export function useCapabilityMembers(capabilityDefinition) {
  const { inProgress, responseData, setErrorOptions, sendRequest } =
    useSelfServiceRequest();
  const [isLoadedMembers, setIsLoadedMembers] = useState(false);
  const [reloadRequired, setReloadRequired] = useState(false);
  const [membersList, setMembersList] = useState([]);

  const membersLink = capabilityDefinition?._links?.members;

  useEffect(() => {
    if (membersLink) {
      sendRequest({
        urlSegments: [membersLink.href],
      });
    }
  }, [membersLink, reloadRequired]);

  useEffect(() => {
    const updateMembers = async (members) => {
      if (members.length !== 0) {
        const updatedList = await Promise.all(
          members.map(async (member) => {
            const profilePictureUrl = await getAnotherUserProfilePictureUrl(
              member.email,
            );
            const updatedMember = { ...member, pictureUrl: profilePictureUrl };
            return updatedMember;
          }),
        );
        setMembersList(updatedList);
      }
    };

    if (responseData?.items.length !== 0) {
      setMembersList((prev) => {
        if (prev.length === 0) {
          return responseData?.items || [];
        } else {
          return prev;
        }
      });

      updateMembers(responseData?.items || []);
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
