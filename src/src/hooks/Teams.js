import { useSelfServiceRequest } from "./SelfServiceApi";
import { useEffect, useState } from "react";

export function useTeams() {
  const { responseData: loadResponse, sendRequest: loadTeams } =
    useSelfServiceRequest();
  const { responseData: addResponse, sendRequest: addTeam } =
    useSelfServiceRequest();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTeams({
      urlSegments: ["teams"],
      method: "GET",
      payload: null,
    });
  }, [addResponse]);

  useEffect(() => {
    if (loadResponse != null) {
      const teams = loadResponse || [];
      setTeams(teams);
      setIsLoading(false);
    }
  }, [loadResponse]);

  const createTeam = async ({ name, description, capabilities }) => {
    setIsLoading(true);
    await addTeam({
      urlSegments: ["teams"],
      method: "POST",
      payload: {
        name: name,
        description: description,
        capabilities: capabilities,
      },
    });
  };

  return {
    createTeam,
    isLoading,
    teams,
  };
}
