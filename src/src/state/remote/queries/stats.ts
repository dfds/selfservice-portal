import { createSsuQuery, createSsuLinkQuery } from "../queryFactory";

export const useStats = createSsuQuery({
  queryKey: ["stats"],
  urlSegments: ["stats"],
});

export const useTopVisitors = createSsuLinkQuery<any>({
  queryKey: (def) => ["topVisitors"],
  linkHref: (def) => def?._links?.topVisitors?.href,
});
