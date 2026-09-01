import React from "react";
import { Link } from "react-router-dom";
import { intlFormatDistance } from "date-fns";
import { useRelevantNews } from "@/state/remote/queries/news";
import { Skeleton } from "@/components/ui/skeleton";

function NewsRow({ item }) {
  const timeAgo = intlFormatDistance(new Date(item.createdAt), new Date());
  return (
    <div>
      <div className="font-mono text-[0.5625rem] text-[#afafaf] dark:text-[#64748b] tracking-[0.04em] mb-[1px]">
        {timeAgo}
      </div>
      <Link
        to={`/news/v/${item.id}`}
        className="text-[0.75rem] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-[1.3] line-clamp-2 no-underline hover:underline"
      >
        {item.title}
      </Link>
    </div>
  );
}

export default function MiniLatestNews() {
  const { isFetched, data } = useRelevantNews();

  const items = (data?.newsItems ?? [])
    .filter((item) => !item.isHighlighted)
    .slice(0, 2);

  return (
    <div className="bg-surface border border-card rounded-[8px] px-3 py-2.5 flex flex-col sm:w-max sm:min-w-[267px] sm:max-w-[calc((var(--ssu-vw)_-_284px)*0.75_-_289px)]">
      <div className="font-mono text-[0.5625rem] font-semibold tracking-[0.08em] uppercase text-muted mb-2">
        Latest News
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {!isFetched ? (
          <>
            <Skeleton className="h-[28px] rounded-[5px]" />
            <Skeleton className="h-[28px] rounded-[5px]" />
          </>
        ) : !items.length ? (
          <p className="font-mono text-[0.625rem] text-muted tracking-[0.03em]">
            No relevant news.
          </p>
        ) : (
          items.map((item) => <NewsRow key={item.id} item={item} />)
        )}
      </div>
      <div className="pt-2">
        <Link
          to="/news"
          className="font-mono text-[0.625rem] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          All news →
        </Link>
      </div>
    </div>
  );
}
