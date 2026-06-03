import * as React from "react";
import { useMemo } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWhatsNew } from "./WhatsNewContext";
import type { TourDefinition } from "./types";

function groupByRelease(
  tours: TourDefinition[],
): Array<{ release: string; tours: TourDefinition[] }> {
  const map = new Map<string, TourDefinition[]>();
  for (const t of tours) {
    const existing = map.get(t.release);
    if (existing) existing.push(t);
    else map.set(t.release, [t]);
  }
  return Array.from(map.entries()).map(([release, tours]) => ({
    release,
    tours,
  }));
}

export function WhatsNewListModal() {
  const {
    tours,
    isListOpen,
    closeList,
    startTour,
    dismiss,
    dismissAll,
    isCompleted,
  } = useWhatsNew();

  const groups = useMemo(() => groupByRelease(tours), [tours]);

  return (
    <Dialog
      open={isListOpen}
      onOpenChange={(open) => {
        if (!open) closeList();
      }}
    >
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase text-sm tracking-[0.08em]">
            <Sparkles size={16} />
            What's New
          </DialogTitle>
          <DialogDescription>
            Recent changes to the portal. Take a guided tour to see them in
            place, or dismiss the ones you don't care about.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {tours.length === 0 && (
            <EmptyState>Nothing new right now — check back later.</EmptyState>
          )}

          {groups.map(({ release, tours }) => (
            <div key={release} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted font-mono">
                  Release
                </span>
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase font-mono text-[var(--color-warning)]">
                  {release}
                </span>
              </div>
              {tours.map((tour) => {
                const completed = isCompleted(tour.id);
                const hasTour = tour.steps.length > 0;
                return (
                  <div
                    key={tour.id}
                    className="border border-card rounded-[8px] p-4 bg-surface"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-primary">
                            {tour.title}
                          </h3>
                          {completed && (
                            <Badge variant="soft-success">
                              <CheckCircle2 size={12} className="mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-description mt-1">{tour.summary}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismiss(tour.id)}
                      >
                        Dismiss
                      </Button>
                      {hasTour && (
                        <Button
                          variant="action"
                          size="sm"
                          onClick={() => startTour(tour.id)}
                        >
                          {completed ? "Replay tour" : "Take the tour"}
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {tours.length > 0 && (
          <DialogFooter className="mt-6">
            <Button variant="ghost" size="sm" onClick={dismissAll}>
              Dismiss all
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
