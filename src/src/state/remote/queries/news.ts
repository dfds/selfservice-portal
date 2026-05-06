import { createSsuQuery, createSsuMutation } from "../queryFactory";

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  dueDate: string;
  isHighlighted: boolean;
  isRelevant: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt: string | null;
  _links: Record<string, unknown>;
}

interface RelevantNewsResponse {
  newsItems: NewsItem[];
  _links: Record<string, unknown>;
}

export const useRelevantNews = createSsuQuery<RelevantNewsResponse>({
  queryKey: ["news", "relevant"],
  urlSegments: ["news", "relevant"],
  staleTime: 60000,
});

export const useNews = createSsuQuery<RelevantNewsResponse, NewsItem[]>({
  queryKey: ["news", "list"],
  urlSegments: ["news"],
  select: (data) => data.newsItems,
});

export const useCreateNews = createSsuMutation<{
  payload: { title: string; body: string; dueDate: string };
}>({
  method: "POST",
  urlSegments: () => ["news"],
});

export const useDeleteNews = createSsuMutation<{ id: string }>({
  method: "DELETE",
  urlSegments: (data) => ["news", data.id],
  payload: () => null,
});

export const useHighlightNews = createSsuMutation<{ id: string }>({
  method: "POST",
  urlSegments: (data) => ["news", data.id, "highlight"],
  payload: () => null,
});
