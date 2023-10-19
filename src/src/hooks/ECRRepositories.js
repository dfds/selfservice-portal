import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useECRRepositories() {
  const { responseData: loadResponse, sendRequest: loadRepositories } =
    useSelfServiceRequest();
  const { responseData: addResponse, sendRequest: addRepository } =
    useSelfServiceRequest();
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRepositories({
      urlSegments: ["ecr/repositories"],
      method: "GET",
      payload: null,
    });
  }, [addResponse]);

  useEffect(() => {
    if (loadResponse != null) {
      const repositories = loadResponse || [];
      setRepositories(repositories);
      setIsLoading(false);
    }
  }, [loadResponse]);

  const createRepository = async ({ name, description, repositoryName }) => {
    setIsLoading(true);
    await addRepository({
      urlSegments: ["ecr/repositories"],
      method: "POST",
      payload: {
        name: name,
        description: description,
        repositoryName: repositoryName,
      },
    });
  };

  return {
    createRepository,
    isLoading,
    repositories,
  };
}
