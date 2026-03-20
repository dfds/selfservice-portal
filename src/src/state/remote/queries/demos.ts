import {
  createSsuQuery,
  createSsuMutation,
} from "../queryFactory";

export const useDemoSignups = createSsuQuery({
  queryKey: ["demosignups"],
  urlSegments: ["demos/signups"],
  select: (data: any) => data.items || [],
});

export const useDemos = createSsuQuery({
  queryKey: ["demos"],
  urlSegments: ["demos"],
  select: (data: any) => data.demos || [],
});

export const useRegisterDemo = createSsuMutation<any>({
  method: "POST",
  urlSegments: () => ["demos"],
  payload: (data) => data,
});

export const useDeleteDemo = createSsuMutation<any>({
  method: "DELETE",
  urlSegments: (data) => ["demos", data.demoId],
  payload: () => null,
});

export const useUpdateDemo = createSsuMutation<any>({
  method: "POST",
  urlSegments: (data) => ["demos", data.id],
  payload: (data) => data,
});
