import * as React from "react";
import { Sparkles } from "lucide-react";
import { useWhatsNew } from "@/whatsNew/WhatsNewContext";

const SparklesPaths = (
  <>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </>
);

function RainbowSparkles() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ssu-whatsnew-rainbow"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="24"
          spreadMethod="repeat"
        >
          <stop offset="0" stopColor="#ff3b30" />
          <stop offset="0.17" stopColor="#ff9500" />
          <stop offset="0.33" stopColor="#ffcc00" />
          <stop offset="0.50" stopColor="#34c759" />
          <stop offset="0.67" stopColor="#0e7cc1" />
          <stop offset="0.83" stopColor="#5856d6" />
          <stop offset="1" stopColor="#ff3b30" />
          <animate
            attributeName="y1"
            from="0"
            to="24"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="24"
            to="48"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <linearGradient
          id="ssu-whatsnew-sheen"
          gradientUnits="userSpaceOnUse"
          x1="-4"
          y1="-4"
          x2="4"
          y2="4"
        >
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.95" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from="-6 -6"
            to="30 30"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <g fill="url(#ssu-whatsnew-rainbow)" stroke="url(#ssu-whatsnew-rainbow)">
        {SparklesPaths}
      </g>
      <g fill="url(#ssu-whatsnew-sheen)" stroke="url(#ssu-whatsnew-sheen)">
        {SparklesPaths}
      </g>
    </svg>
  );
}

export default function WhatsNewBell() {
  const { unseenCount, hasUnseenReleaseNotes, openList } = useWhatsNew();
  const hasUnseen = unseenCount > 0 || hasUnseenReleaseNotes;
  return (
    <button
      type="button"
      data-tour="whats-new-bell"
      onClick={openList}
      aria-label={hasUnseen ? `What's New (${unseenCount} new)` : "What's New"}
      className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[6px] text-secondary hover:text-primary hover:bg-[#f2f2f2] dark:hover:bg-[#1e2d3d] border-0 bg-transparent cursor-pointer"
    >
      {hasUnseen ? (
        <RainbowSparkles />
      ) : (
        <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
      )}
      {hasUnseen && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: "currentColor" }}
          className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full animate-rainbow-text animate-badge-pulse"
        />
      )}
    </button>
  );
}
