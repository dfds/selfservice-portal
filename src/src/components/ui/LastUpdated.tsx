import { useEffect, useState } from "react";
import { intlFormatDistance } from "date-fns";
import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogMeta } from "@/state/remote/queries/catalog";

export function catalogUpdatedAt(
  meta: CatalogMeta | undefined,
  clientFetchedAt?: number,
): number | undefined {
  if (meta?.publishedAt) return new Date(meta.publishedAt).getTime();
  if (meta?.collectedAt) return new Date(meta.collectedAt).getTime();
  return clientFetchedAt;
}

export function LastUpdated({
  updatedAt,
  isFetching,
  className,
}: {
  updatedAt?: number;
  isFetching?: boolean;
  className?: string;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!updatedAt) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] text-muted",
        className,
      )}
      title={new Date(updatedAt).toLocaleString()}
    >
      {isFetching ? (
        <RefreshCw size={11} className="animate-spin" />
      ) : (
        <Clock size={11} />
      )}
      Updated {intlFormatDistance(updatedAt, new Date())}
    </span>
  );
}
