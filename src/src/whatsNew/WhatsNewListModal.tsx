import * as React from "react";
import { useMemo } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useReleaseNotes } from "@/state/remote/queries/releaseNotes";
import { useRybbit } from "@/RybbitContext";
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

function formatCompactDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  const defaultOpenReleases = useMemo(
    () => (groups[0] ? [groups[0].release] : []),
    [groups],
  );

  const navigate = useNavigate();
  const { trackEvent } = useRybbit();
  const { data: releaseNotesData } = useReleaseNotes({});

  const recentNotes = useMemo(() => {
    const items: any[] = releaseNotesData?.items ?? [];
    return items
      .filter((n) => n.isActive === true)
      .sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      )
      .slice(0, 3);
  }, [releaseNotesData]);

  return (
    <Dialog
      open={isListOpen}
      onOpenChange={(open) => {
        if (!open) closeList();
      }}
    >
      <DialogContent className="max-w-[min(48rem,calc(0.95*var(--ssu-vw)))] max-h-[calc(0.8*var(--ssu-vh))] overflow-y-auto">
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

        {recentNotes.length > 0 && (
          <div className="mt-3 pb-3 border-b border-divider">
            <SectionLabel className="mb-1 block">
              Recent release notes
            </SectionLabel>
            <ul className="divide-y divide-divider">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <a
                    href={`/release-notes/v/${note.id}`}
                    onClick={(e) => {
                      if (
                        e.defaultPrevented ||
                        e.button !== 0 ||
                        e.metaKey ||
                        e.ctrlKey ||
                        e.altKey ||
                        e.shiftKey
                      )
                        return;
                      e.preventDefault();
                      trackEvent("whatsnew:release-note:opened", {
                        note_id: note.id,
                      });
                      closeList();
                      navigate(`/release-notes/v/${note.id}`);
                    }}
                    className="flex items-baseline gap-3 py-1.5 -mx-2 px-2 rounded-[4px] no-underline hover:bg-surface-muted transition-colors"
                  >
                    <time
                      dateTime={note.releaseDate}
                      className="font-mono text-[11px] text-muted tabular-nums shrink-0 w-[88px]"
                    >
                      {formatCompactDate(note.releaseDate)}
                    </time>
                    <span className="font-mono text-sm text-primary flex-1 truncate">
                      {note.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2">
          {tours.length > 0 && (
            <Accordion type="multiple" defaultValue={defaultOpenReleases}>
              {groups.map(({ release, tours: releaseTours }) => (
                <AccordionItem
                  key={release}
                  value={release}
                  className="border-b-0"
                >
                  <AccordionTrigger className="py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted font-mono">
                        Release
                      </span>
                      <span className="text-[10px] font-semibold tracking-[0.08em] uppercase font-mono text-[var(--color-warning)]">
                        {release}
                      </span>
                      <span className="text-[10px] font-mono text-muted ml-auto mr-2">
                        {releaseTours.length}{" "}
                        {releaseTours.length === 1 ? "tour" : "tours"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {releaseTours.map((tour) => {
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
                                      <CheckCircle2
                                        size={12}
                                        className="mr-1"
                                      />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-description mt-1">
                                  {tour.summary}
                                </p>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
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
