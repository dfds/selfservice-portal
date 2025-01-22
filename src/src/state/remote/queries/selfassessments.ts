import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { useContext } from "react";
import PreAppContext from "@/preAppContext";

const sortByName = (list) => {
  list.sort((a, b) => a.shortName.localeCompare(b.shortName));
};

export function useSelfAssessments() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const query = useQuery({
    queryKey: ["selfassessments", "list"],
    queryFn: async () =>
      ssuRequest({
        method: "GET",
        urlSegments: ["capabilities", "self-assessment-options"],
        payload: null,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
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
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
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
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}

export function useSelfAssessmentDeactivate() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
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
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      });
    },
  });

  return mutation;
}

export function useSelfAssessmentAdd() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", "self-assessment-options"],
        payload: data.payload,
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      }),
  });

  return mutation;
}
