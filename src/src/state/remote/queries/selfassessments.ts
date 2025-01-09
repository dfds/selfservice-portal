import { useMutation, useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";

const sortByName = (list) => {
  list.sort((a, b) => a.shortName.localeCompare(b.shortName));
};

export function useSelfAssessments(isEnabledCloudEngineer: boolean) {
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
        isCloudEngineerEnabled: data.isEnabledCloudEngineer,
      }),
  });

  return mutation;
}

export function useSelfAssessmentDeactivate() {
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
        isCloudEngineerEnabled: data.isEnabledCloudEngineer,
      });
    },
  });

  return mutation;
}

export function useSelfAssessmentAdd() {
  const mutation = useMutation({
    mutationFn: async (data: any) =>
      ssuRequest({
        method: "POST",
        urlSegments: ["capabilities", "self-assessment-options"],
        payload: data.payload,
        isCloudEngineerEnabled: data.isEnabledCloudEngineer,
      }),
  });

  return mutation;
}
