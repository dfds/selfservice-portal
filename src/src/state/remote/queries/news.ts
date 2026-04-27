import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ssuRequest } from "../query";
import { createSsuMutation } from "../queryFactory";
import PreAppContext from "@/preAppContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  dueDate: string;
  isHighlighted: boolean;
  isRelevant: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt?: string | null;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useNews() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return useQuery<NewsItem[]>({
    queryKey: ["news", "list"],
    queryFn: async () => {
      const res = await ssuRequest({
        method: "GET",
        urlSegments: isCloudEngineerEnabled ? ["news"] : ["news", "relevant"],
        payload: null,
        isCloudEngineerEnabled,
      });
      return res?.newsItems ?? [];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

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

export const useUpdateNews = createSsuMutation<{
  id: string;
  payload: { title?: string; body?: string; dueDate?: string };
}>({
  method: "POST",
  urlSegments: (data) => ["news", data.id],
});

export const useHighlightNews = createSsuMutation<{ id: string }>({
  method: "POST",
  urlSegments: (data) => ["news", data.id, "highlight"],
  payload: () => null,
});
