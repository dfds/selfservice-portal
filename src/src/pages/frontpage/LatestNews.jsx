import { intlFormatDistance } from "date-fns";
import { TrackedLink } from "@/components/Tracking";
import { useLatestNews } from "@/hooks/LatestNews";
import { SkeletonNewsItem } from "@/components/ui/skeleton";

function NewsItem({ date, title, link, index = 0 }) {
  const timeAgo = intlFormatDistance(date, new Date());
  return (
    <div
      className="py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="font-mono text-[10px] text-[#afafaf] dark:text-[#64748b] tracking-[0.04em] mb-[2px]">
        {timeAgo}
      </div>
      <div className="text-[13px] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-[1.4] mb-[3px]">
        {title}
      </div>
      <TrackedLink
        trackName={`NewsItem-${title}`}
        href={link}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[11px] text-[#0e7cc1] dark:text-[#60a5fa] no-underline tracking-[0.03em] hover:underline"
      >
        read_more →<span className="sr-only"> (opens in new tab)</span>
      </TrackedLink>
    </div>
  );
}

const ONE_MONTH_AGO = Date.now() - 30 * 24 * 60 * 60 * 1000;

export default function LatestNews() {
  const { news, isLoading } = useLatestNews();

  if (isLoading) {
    return (
      <div>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonNewsItem key={i} isFirst={i === 0} isLast={i === 3} />
        ))}
      </div>
    );
  }

  const recent = news.filter((x) => x.date >= ONE_MONTH_AGO).slice(0, 4);

  if (!recent.length) {
    return (
      <p className="font-mono text-[11px] text-muted tracking-[0.03em]">
        No incidents in the past month.
      </p>
    );
  }

  return (
    <div>
      {recent.map((x, i) => (
        <NewsItem key={x.id} index={i} {...x} />
      ))}
      <div className="pt-[0.625rem]">
        <a
          href="https://dfdsit.statuspage.io"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          View all incidents →
        </a>
      </div>
    </div>
  );
}
