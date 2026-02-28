import { Spinner } from "@/components/ui/spinner";
import { intlFormatDistance } from "date-fns";
import { TrackedLink } from "@/components/Tracking";
import { useLatestNews } from "hooks/LatestNews";

function NewsItem({ date, title, link }) {
  const timeAgo = intlFormatDistance(date, new Date());
  return (
    <div className="py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0">
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
        read_more →
      </TrackedLink>
    </div>
  );
}

export default function LatestNews() {
  const news = useLatestNews();
  return (
    <div>
      {news.length === 0 && <Spinner />}
      {news.slice(0, 4).map((x) => (
        <NewsItem key={x.id} {...x} />
      ))}
    </div>
  );
}
