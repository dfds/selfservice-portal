import React, { useState, useEffect, useContext } from "react";
import Page from "@/components/Page";
import { TrackedButton } from "@/components/Tracking";
import Nope from "@/components/Nope";

import {
  useReleaseNotes,
  useToggleReleaseNoteActive,
  useDeleteReleaseNote,
} from "@/state/remote/queries/releaseNotes";
import { useNavigate } from "react-router-dom";
import PreAppContext from "@/preAppContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { useMutationToast } from "@/hooks/useMutationToast";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReleaseNotesManage() {
  const { data } = useReleaseNotes({ includeDrafts: true });
  const toggleReleaseNoteActive = useToggleReleaseNoteActive();
  const deleteReleaseNote = useDeleteReleaseNote();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const [notes, setNotes] = useState(data?.items || []);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    if (data?.items) {
      setNotes(data.items);
    }
  }, [data]);

  const navigate = useNavigate();

  const fireToggleActive = useMutationToast(toggleReleaseNoteActive, {
    invalidateKeys: [["releasenotes", "list"]],
    successMessage: "Release note status updated",
    errorMessage: "Could not update release note status",
  });

  const fireDelete = useMutationToast(deleteReleaseNote, {
    invalidateKeys: [["releasenotes", "list"]],
    successMessage: "Release note deleted",
    errorMessage: "Could not delete release note",
    onSuccess: () => setDeleteTarget(null),
  });

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Release Note"
        description={
          <p>
            This action will delete the release note and all its content. This
            action cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && fireDelete({ id: deleteTarget.id })}
      />

      {isCloudEngineerEnabled ? (
        <Page title="Release Notes archive">
          <div className="flex items-center justify-end mb-4">
            <TrackedButton
              onClick={() => navigate("/release-notes/create")}
              variation="action"
              trackName="ReleaseNote-CreateButtonClicked"
              trackingEvent={{
                category: "ReleaseNotes",
                action: "CreateNew",
                label: "Create Release Note",
              }}
            >
              Create Release Note
            </TrackedButton>
          </div>

          <div className="bg-surface border border-card rounded-[8px] overflow-hidden animate-fade-up">
            {notes.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted text-sm font-mono">
                No release notes found
              </div>
            ) : (
              notes.map((elem, index) => (
                <div
                  key={elem.id}
                  className={`flex flex-col sm:flex-row sm:items-start gap-3 px-5 py-4 ${
                    index !== notes.length - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[14px] font-semibold text-primary">
                        {elem.title}
                      </span>
                      <Badge
                        variant={elem.isActive ? "soft-success" : "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {elem.isActive ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[11px] text-muted">
                        Release: {formatDate(elem.releaseDate)}
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        Created: {formatDate(elem.createdAt)} by{" "}
                        {elem.createdBy ?? "—"}
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        Modified: {formatDate(elem.modifiedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row flex-wrap gap-2 shrink-0">
                    {elem._links?.toggleIsActive && (
                      <TrackedButton
                        trackName="ReleaseNote-ToggleActiveButtonClicked"
                        onClick={() => fireToggleActive({ id: elem.id })}
                        variation={elem.isActive ? "outline" : "action"}
                        size="small"
                        trackingEvent={{
                          category: "ReleaseNotes",
                          action: "ToggleActive",
                          label: elem.isActive ? "Unpublish" : "Publish",
                        }}
                      >
                        {elem.isActive ? "Unpublish" : "Publish"}
                      </TrackedButton>
                    )}
                    <TrackedButton
                      trackName="ReleaseNote-EditButtonClicked"
                      onClick={() => navigate(`/release-notes/edit/${elem.id}`)}
                      variation="outline"
                      size="small"
                      trackingEvent={{
                        category: "ReleaseNotes",
                        action: "View",
                        label: `Edit Release Note: ${elem.id}`,
                      }}
                    >
                      Edit
                    </TrackedButton>
                    {elem._links?.remove && (
                      <TrackedButton
                        trackName="ReleaseNote-DeleteButtonClicked"
                        onClick={() => setDeleteTarget(elem)}
                        variation="danger"
                        size="small"
                        trackingEvent={{
                          category: "ReleaseNotes",
                          action: "Delete",
                          label: "Delete Release Note",
                        }}
                      >
                        Delete
                      </TrackedButton>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Page>
      ) : (
        <Nope />
      )}
    </>
  );
}

export default ReleaseNotesManage;
