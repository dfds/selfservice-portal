import React from "react";
import { Link } from "react-router-dom";
import { intlFormatDistance } from "date-fns";
import { useRelevantNews } from "@/state/remote/queries/news";
import { SkeletonNewsItem } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

function RelevantNewsItem({ item, index }) {
  const timeAgo = intlFormatDistance(new Date(item.createdAt), new Date());

  return (
    <Link
      to={`/news/v/${item.id}`}
      className={`block no-underline text-inherit py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0 animate-fade-up hover:bg-surface-muted transition-colors${
        item.isHighlighted
          ? " bg-[rgba(237,136,0,0.04)] dark:bg-[rgba(237,136,0,0.04)] rounded-[4px] px-[6px] -mx-[6px]"
          : ""
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-[2px]">
        <div className="font-mono text-[0.625rem] text-[#afafaf] dark:text-[#64748b] tracking-[0.04em]">
          {timeAgo}
        </div>
      </div>
      <div className="text-[0.8125rem] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-[1.4] mb-[3px]">
        {item.title}
      </div>
      {item.body && (
        <p className="font-mono text-[0.6875rem] text-muted leading-[1.5] line-clamp-2">
          {item.body}
        </p>
      )}
    </Link>
  );
}

export default function RelevantNews() {
  const { isFetched, data } = useRelevantNews();

  if (!isFetched) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <SkeletonNewsItem key={i} isFirst={i === 0} isLast={i === 2} />
        ))}
      </div>
    );
  }

  const items = (data?.newsItems ?? []).filter((item) => !item.isHighlighted);

  if (!items.length) {
    return (
      <p className="font-mono text-[0.6875rem] text-muted tracking-[0.03em]">
        No relevant news at this time.
      </p>
    );
  }

  return (
    <div>
      {items.map((item, i) => (
        <RelevantNewsItem key={item.id} item={item} index={i} />
      ))}
      <div className="pt-[0.625rem]">
        <Link
          to="/news"
          className="font-mono text-[0.6875rem] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          View all news →
        </Link>
      </div>
    </div>
  );
}
