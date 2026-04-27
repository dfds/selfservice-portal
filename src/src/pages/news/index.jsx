import React, { useContext, useState } from "react";
import { intlFormatDistance } from "date-fns";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/InfoAlert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PreAppContext from "@/preAppContext";
import {
  useNews,
  useCreateNews,
  useDeleteNews,
  useHighlightNews,
} from "@/state/remote/queries/news";
import { useMutationToast } from "@/hooks/useMutationToast";
import { Trash2, Plus, Newspaper, Star } from "lucide-react";
import { useTopBarActions } from "@/components/TopBar/TopBarActionsContext";
import { TrackedButton } from "@/components/Tracking";

// ── Create modal ──────────────────────────────────────────────────────────────

function CreateNewsModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );

  const createNews = useCreateNews();
  const submit = useMutationToast(createNews, {
    invalidateKeys: [["news", "list"]],
    successMessage: "News item created",
    errorMessage: "Failed to create news item",
    onSuccess: onClose,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    submit({
      payload: {
        title: title.trim(),
        body: body.trim(),
        dueDate: new Date(dueDate).toISOString(),
      },
    });
  };

  const isValid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create news item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[12px] font-semibold text-secondary mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              className="w-full rounded-[6px] border border-card bg-surface px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-secondary mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the news item content…"
              rows={6}
              className="w-full rounded-[6px] border border-card bg-surface px-3 py-2 text-[13px] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-secondary mb-1">
              Relevant until
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-[6px] border border-card bg-surface px-3 py-2 text-[13px] text-primary focus:outline-none focus:ring-2 focus:ring-action"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createNews.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createNews.isPending}
            >
              {createNews.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── News item row ─────────────────────────────────────────────────────────────

function NewsRow({ item, isCloudEngineerEnabled, onDeleted }) {
  const deleteNews = useDeleteNews();
  const remove = useMutationToast(deleteNews, {
    invalidateKeys: [["news", "list"]],
    successMessage: "News item deleted",
    errorMessage: "Failed to delete news item",
    onSuccess: onDeleted,
  });

  const highlightNews = useHighlightNews();
  const toggleHighlight = useMutationToast(highlightNews, {
    invalidateKeys: [["news", "list"]],
    successMessage: item.isHighlighted ? "Highlight removed" : "News item highlighted",
    errorMessage: "Failed to update highlight",
  });

  const timeAgo = intlFormatDistance(new Date(item.createdAt), new Date());

  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-divider last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-semibold text-primary leading-snug">
            {item.title}
          </span>
          {item.isHighlighted && (
            <span className="inline-flex items-center h-[18px] px-1.5 rounded-[4px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-[10px] tracking-[0.04em]">
              highlighted
            </span>
          )}
        </div>
        <p className="text-[13px] text-secondary leading-relaxed line-clamp-2">
          {item.body}
        </p>
        <div className="mt-1.5 font-mono text-[11px] text-muted">
          {timeAgo}
          {item.createdBy && (
            <span className="ml-2 text-muted opacity-70">
              by {item.createdBy}
            </span>
          )}
        </div>
      </div>

      {isCloudEngineerEnabled && (
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <button
            aria-label={item.isHighlighted ? `Remove highlight from "${item.title}"` : `Highlight "${item.title}"`}
            onClick={() => toggleHighlight({ id: item.id })}
            disabled={highlightNews.isPending}
            className={`p-1.5 rounded-[5px] transition-colors disabled:opacity-40 ${
              item.isHighlighted
                ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                : "text-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          >
            <Star size={14} fill={item.isHighlighted ? "currentColor" : "none"} />
          </button>
          <button
            aria-label={`Delete "${item.title}"`}
            onClick={() => remove({ id: item.id })}
            disabled={deleteNews.isPending}
            className="p-1.5 rounded-[5px] text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page skeleton ─────────────────────────────────────────────────────────────

function NewsListSkeleton() {
  return (
    <div className="bg-surface border border-card rounded-[8px] overflow-hidden animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-4 border-b border-divider last:border-0"
        >
          <div className="h-[14px] w-2/3 rounded bg-surface-muted mb-2" />
          <div className="h-[12px] w-full rounded bg-surface-muted mb-1" />
          <div className="h-[12px] w-4/5 rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { setActions } = useTopBarActions();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isFetched } = useNews();

  React.useEffect(() => {
    if (!isCloudEngineerEnabled) {
      setActions(null);
      return;
    }
    setActions(
      <TrackedButton
        trackName="News-CreateClicked"
        size="sm"
        onClick={() => setShowCreate(true)}
      >
        <Plus size={14} className="mr-1" />
        New item
      </TrackedButton>,
    );
    return () => setActions(null);
  }, [isCloudEngineerEnabled]);

  const items = data ?? [];
  const visibleItems = isCloudEngineerEnabled
    ? items
    : items.filter((n) => n.isRelevant);

  return (
    <Page title="News">
      {showCreate && (
        <CreateNewsModal onClose={() => setShowCreate(false)} />
      )}

      <InfoAlert className="mb-4 animate-fade-up animate-stagger-1">
        <p className="font-semibold mb-1">Platform news</p>
        <p>
          Updates, announcements and other news from the Cloud Engineering
          platform team.
        </p>
      </InfoAlert>

      {!isFetched ? (
        <NewsListSkeleton />
      ) : visibleItems.length === 0 ? (
        <div className="bg-surface border border-card rounded-[8px] px-5 py-12 text-center animate-fade-up">
          <Newspaper size={32} className="text-muted mx-auto mb-3" />
          <p className="text-[14px] text-muted font-mono">No news items yet</p>
        </div>
      ) : (
        <div className="bg-surface border border-card rounded-[8px] overflow-hidden animate-fade-up">
          {visibleItems.map((item) => (
            <NewsRow
              key={item.id}
              item={item}
              isCloudEngineerEnabled={isCloudEngineerEnabled}
              onDeleted={() => {}}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
