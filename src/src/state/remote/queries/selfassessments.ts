import { sortByField } from "@/lib/utils";
import { createSsuQuery, createSsuMutation } from "../queryFactory";

const sortByName = sortByField<any>("shortName");

export const useSelfAssessments = createSsuQuery({
  queryKey: ["selfassessments", "list"],
  urlSegments: ["capabilities", "self-assessment-options"],
  select: (data: any) => {
    let list = data || [];
    sortByName(list);
    return list;
  },
  staleTime: 30000,
});

export const useSelfAssessmentActivate = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    "self-assessment-options",
    data.id,
    "activate",
  ],
  payload: () => null,
});

export const useSelfAssessmentDeactivate = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => [
    "capabilities",
    "self-assessment-options",
    data.id,
    "deactivate",
  ],
  payload: () => null,
});

export const useSelfAssessmentAdd = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["capabilities", "self-assessment-options"],
  payload: (data) => data.payload,
});
