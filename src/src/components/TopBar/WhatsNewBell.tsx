import * as React from "react";
import { Sparkles } from "lucide-react";
import { useWhatsNew } from "@/whatsNew/WhatsNewContext";

export default function WhatsNewBell() {
  const { unseenCount, openList } = useWhatsNew();
  return (
    <button
      type="button"
      data-tour="whats-new-bell"
      onClick={openList}
      aria-label={
        unseenCount > 0 ? `What's New (${unseenCount} new)` : "What's New"
      }
      className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[6px] text-secondary hover:text-primary hover:bg-[#f2f2f2] dark:hover:bg-[#1e2d3d] border-0 bg-transparent cursor-pointer"
    >
      <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
      {unseenCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[var(--color-action)]"
        />
      )}
    </button>
  );
}
