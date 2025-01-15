import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

const sortByName = (list) => {
  list.sort((a, b) => a.shortName.localeCompare(b.shortName));
};

export function useSelfAssessments() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["selfassessments", "list"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", "self-assessment-options"],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
    select: (data: any) => {
      let list = data || [];
      sortByName(list);
      return list;
    },
    staleTime: 30000,
  });

  return query;
}

export function useSelfAssessmentActivate() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: [
          "capabilities",
          "self-assessment-options",
          data.id,
          "activate",
        ],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useSelfAssessmentDeactivate() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      ssuRequest({
        method: "POST",
        urlSegments: [
          "capabilities",
          "self-assessment-options",
          data.id,
          "deactivate",
        ],
        payload: null,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      });
    },
  });

  return mutation;
}

export function useSelfAssessmentAdd() {
  const { isEnabledCloudEngineer } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", "self-assessment-options"],
        payload: data.payload,
        isCloudEngineerEnabled: isEnabledCloudEngineer,
      }),
  });

  return mutation;
}
