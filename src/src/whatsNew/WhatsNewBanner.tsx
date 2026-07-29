import * as React from "react";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Banner, BannerParagraph } from "@/components/ui/banner";
import { useWhatsNew } from "./WhatsNewContext";

const SESSION_FLAG_PREFIX = "ssu-whatsnew-banner-shown-";

function shouldShow(latestId: string | null): boolean {
  if (!latestId) return true;
  try {
    return !sessionStorage.getItem(SESSION_FLAG_PREFIX + latestId);
  } catch {
    return true;
  }
}

function markShown(latestId: string | null): void {
  if (!latestId) return;
  try {
    sessionStorage.setItem(SESSION_FLAG_PREFIX + latestId, "1");
  } catch {
    // ignore
  }
}

export function WhatsNewBanner() {
  const { hasUnseenLatest, latestTourId, openList, dismiss } = useWhatsNew();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasUnseenLatest && shouldShow(latestTourId)) {
      setVisible(true);
      markShown(latestTourId);
    }
  }, [hasUnseenLatest, latestTourId]);

  if (!visible || !hasUnseenLatest) return null;

  return (
    <div className="px-5 md:px-8 pt-3">
      <Banner variant="info">
        <BannerParagraph>
          <span className="inline-flex items-center gap-2 flex-wrap">
            <Sparkles size={14} aria-hidden="true" />
            <span className="font-medium">
              New: see what changed in this release.
            </span>
            <button
              type="button"
              onClick={() => {
                openList();
                setVisible(false);
              }}
              className="underline text-action hover:text-primary bg-transparent border-0 cursor-pointer p-0 font-inherit"
            >
              Show me
            </button>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => {
                if (latestTourId) dismiss(latestTourId);
                setVisible(false);
              }}
              className="inline-flex items-center justify-center min-h-[24px] min-w-[24px] rounded-[4px] bg-transparent border-0 cursor-pointer text-secondary hover:text-primary hover:bg-[#f2f2f2] dark:hover:bg-[#1e2d3d]"
            >
              <X size={14} />
            </button>
          </span>
        </BannerParagraph>
      </Banner>
    </div>
  );
}
