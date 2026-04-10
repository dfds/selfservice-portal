import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PreviewItem {
  capabilityId: string;
  capabilityName: string;
  subject: string;
  html: string;
}

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previews: PreviewItem[];
  loading: boolean;
}

export function PreviewDialog({
  open,
  onOpenChange,
  previews,
  loading,
}: PreviewDialogProps) {
  const [index, setIndex] = useState(0);

  const current = previews[index];
  const hasPrev = index > 0;
  const hasNext = index < previews.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : previews.length === 0 ? (
          <p className="text-[13px] text-muted py-4">
            No matching capabilities found for preview.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 border-b border-card">
              <div className="min-w-0">
                <span className="text-[11px] text-muted font-mono block truncate">
                  {current.capabilityId}
                </span>
                <span className="text-[13px] font-medium text-primary block truncate">
                  {current.capabilityName}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => setIndex((i) => i - 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-[11px] text-muted px-1">
                  {index + 1} / {previews.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setIndex((i) => i + 1)}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>

            <div className="py-2">
              <span className="text-[11px] text-muted font-mono">
                Subject:
              </span>
              <span className="text-[13px] text-primary ml-2">
                {current.subject}
              </span>
            </div>

            <div className="flex-1 overflow-auto border border-card rounded-lg bg-white">
              <iframe
                srcDoc={current.html}
                title="Email preview"
                className="w-full min-h-[400px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
