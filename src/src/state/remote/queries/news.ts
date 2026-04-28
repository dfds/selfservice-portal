import { createSsuQuery } from "../queryFactory";

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
