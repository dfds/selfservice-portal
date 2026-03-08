import React, { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

const AUTO_DISMISS_MS = 4500;

interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
  variant?: "success" | "error";
}

const VARIANTS = {
  success: { bg: "#1a5233", icon: CheckCircle2, iconColor: "text-[#4ade80]" },
  error: { bg: "#6b1a1a", icon: XCircle, iconColor: "text-[#f87171]" },
};

export default function SuccessToast({
  message,
  onDismiss,
  variant = "success",
}: SuccessToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const dismiss = () => setIsExiting(true);

  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const frame = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (elapsed < AUTO_DISMISS_MS) {
        raf = requestAnimationFrame(frame);
      } else {
        dismiss();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleAnimationEnd = () => {
    if (isExiting) onDismiss();
  };

  const { bg, icon: Icon, iconColor } = VARIANTS[variant];

  return (
    <div
      className={`pointer-events-auto w-[290px] rounded-[5px] overflow-hidden ${
        isExiting ? "animate-toast-exit" : "animate-toast-enter"
      }`}
      style={{ background: bg }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="h-[2px] bg-white/20">
        <div
          className="h-full bg-white/50 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-start gap-2.5 px-3.5 py-3">
        <Icon
          size={15}
          className={`${iconColor} shrink-0 mt-px`}
          strokeWidth={2}
        />
        <p className="text-white text-[13px] leading-[1.45] flex-1">
          {message}
        </p>
        <button
          onClick={dismiss}
          className="text-white/40 hover:text-white transition-colors h-4 w-4 shrink-0 flex items-center justify-center mt-px"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
