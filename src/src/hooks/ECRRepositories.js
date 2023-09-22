import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useECRRepositories() {
  const { responseData: loadResponse, sendRequest: loadRepositories } = useSelfServiceRequest();
  const { responseData: addResponse, sendRequest: addRepository } = useSelfServiceRequest();
  const [ repositories, setRepositories ] = useState([]);

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
    }
  }, [loadResponse]);

  const createRepository = async ({name, description, repositoryName}) => {
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
    repositories,
  };
}
