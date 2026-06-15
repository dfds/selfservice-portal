import React from "react";
import Page from "@/components/Page";
import { useNewsItem } from "@/state/remote/queries/news";
import { useNavigate, useParams } from "react-router-dom";
import { intlFormatDistance } from "date-fns";
import { ArrowLeft, Newspaper } from "lucide-react";
import LinkifiedText from "@/components/Text/LinkifiedText";

export function NewsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFetched, data } = useNewsItem(id);

  return (
    <Page title="">
      <button
        onClick={() => navigate("/news")}
        className="inline-flex items-center gap-1.5 mb-4 font-mono text-[0.75rem] text-muted hover:text-action transition-colors bg-transparent border-none p-0 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to news
      </button>

      {!isFetched ? (
        <div className="bg-surface border border-card rounded-[8px] px-6 py-6 animate-pulse">
          <div className="h-[20px] w-1/2 rounded bg-surface-muted mb-3" />
          <div className="h-[13px] w-1/4 rounded bg-surface-muted mb-6" />
          <div className="h-[13px] w-full rounded bg-surface-muted mb-2" />
          <div className="h-[13px] w-5/6 rounded bg-surface-muted mb-2" />
          <div className="h-[13px] w-4/6 rounded bg-surface-muted" />
        </div>
      ) : !data ? (
        <div className="bg-surface border border-card rounded-[8px] px-5 py-12 text-center">
          <Newspaper size={32} className="text-muted mx-auto mb-3" />
          <p className="text-[0.875rem] text-muted font-mono">
            News item not found
          </p>
        </div>
      ) : (
        <article className="bg-surface border border-card rounded-[8px] px-6 py-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-[1.375rem] font-semibold text-primary leading-tight">
              {data.title}
            </h1>
            {data.isHighlighted && (
              <span className="inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-[0.625rem] tracking-[0.04em] shrink-0">
                highlighted
              </span>
            )}
          </div>
          <div className="font-mono text-[0.6875rem] text-muted mb-6">
            {intlFormatDistance(new Date(data.createdAt), new Date())}
            {data.createdBy && (
              <span className="ml-2 opacity-70">by {data.createdBy}</span>
            )}
          </div>
          <p className="text-[0.875rem] text-secondary leading-relaxed whitespace-pre-wrap">
            <LinkifiedText text={data.body} linkClassName="text-action underline" />
          </p>
        </article>
      )}
    </Page>
  );
}

export default NewsView;
