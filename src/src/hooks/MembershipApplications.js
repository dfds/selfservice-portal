import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useMembershipApplications() {
  const { responseData: getAllResponse, sendRequest } = useSelfServiceRequest();
  const [isLoaded, setIsLoaded] = useState(false);
  const [membershipApplications, setMembershipApplications] = useState([]);

  const sortByCapabilityId = (list) => {
    list.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
  };

  const reload = () => {
    sendRequest({
      urlSegments: ["membershipapplications/me"],
      method: "GET",
      payload: null,
    });
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    const list = getAllResponse?.items || [];
    sortByCapabilityId(list);

    setMembershipApplications(list);
    setIsLoaded(true);
  }, [getAllResponse]);

  return {
    isLoaded,
    membershipApplications,
    reload,
  };
}
