import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface UnsavedChangesPromptProps {
  /** When true, navigating away (in-app or browser-level) is guarded. */
  when: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Warns the user before they lose unsaved changes.
 *
 * - In-app navigation (sidebar links, back/forward) is intercepted via the data
 *   router's `useBlocker`, surfacing a confirmation dialog.
 * - Tab close / refresh / hard navigation is caught with a `beforeunload`
 *   listener (the browser shows its own native prompt).
 *
 * Requires a data router (`createBrowserRouter` + `<RouterProvider>`).
 */
export function UnsavedChangesPrompt({
  when,
  title = "Discard unsaved changes?",
  message = "You have unsaved changes that will be lost if you leave this page.",
  confirmLabel = "Leave",
  cancelLabel = "Stay",
}: UnsavedChangesPromptProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  // Warn on tab close / refresh / hard navigation.
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers require returnValue to be set.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  // If the guard clears while a navigation is held (e.g. the change was saved),
  // let the pending navigation through automatically.
  useEffect(() => {
    if (blocker.state === "blocked" && !when) {
      blocker.proceed();
    }
  }, [blocker, when]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(open) => {
        if (!open && blocker.state === "blocked") blocker.reset();
      }}
      title={title}
      description={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmVariant="destructive"
      onConfirm={() => {
        if (blocker.state === "blocked") blocker.proceed();
      }}
    />
  );
}
