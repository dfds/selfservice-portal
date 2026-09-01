import React from "react";
import { EmptyState } from "@/components/ui/EmptyState";

interface ListPageContentProps<T> {
  isFetched: boolean;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  skeletonCount?: number;
  renderSkeleton?: (index: number) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  className?: string;
}

export function ListPageContent<T>({
  isFetched,
  items,
  renderItem,
  skeletonCount = 5,
  renderSkeleton,
  emptyMessage = "No items found.",
  emptyIcon,
  className = "space-y-2",
}: ListPageContentProps<T>) {
  if (!isFetched) {
    return (
      <div className={className}>
        {renderSkeleton
          ? Array.from({ length: skeletonCount }).map((_, i) =>
              renderSkeleton(i),
            )
          : Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="border border-card rounded-[8px] p-4 animate-pulse"
              >
                <div className="h-4 w-48 bg-surface-muted rounded" />
              </div>
            ))}
      </div>
    );
  }

  if (items.length === 0) {
    if (emptyIcon) {
      return (
        <div className="flex flex-col items-center py-12 text-center gap-3">
          {emptyIcon}
          <EmptyState>{emptyMessage}</EmptyState>
        </div>
      );
    }
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <div className={className}>
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );
}
