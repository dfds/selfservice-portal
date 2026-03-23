import React, { useState, useEffect, useContext } from "react";
import { SkeletonReleaseNoteRow } from "@/components/ui/skeleton";
import Page from "@/components/Page";
import { useReleaseNotes } from "@/state/remote/queries/releaseNotes";
import { TrackedButton } from "@/components/Tracking";
import PreAppContext from "@/preAppContext";
import DateFlag from "../../components/DateFlag/DateFlag";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

function ManageButton({ onClick }) {
  return (
    <TrackedButton
      onClick={onClick}
      variation="action"
      trackName="ReleaseNotes-ManageContentClicked"
      trackingEvent={{
        category: "ReleaseNotes",
        action: "ManageContent",
        label: "Manage content",
      }}
    >
      Manage content
    </TrackedButton>
  );
}

function ReleaseNotesList() {
  const { isFetched, data } = useReleaseNotes({});
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const [notes, setNotes] = useState(data?.items || []);
  useEffect(() => {
    if (data?.items) {
      setNotes(data.items);
    }
  }, [data]);

  const navigate = useNavigate();

  const visibleNotes = notes.filter(
    (note) => note.isActive || isCloudEngineerEnabled,
  );

  return (
    <div className="bg-surface border border-card rounded-[8px] overflow-hidden animate-fade-up">
      {isFetched ? (
        <>
          {visibleNotes.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted text-sm font-mono">
              No release notes found
            </div>
          ) : (
            visibleNotes.map((note, index) => (
              <a
                href={`/release-notes/v/${note.id}`}
                onClick={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.altKey ||
                    event.shiftKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  navigate(`/release-notes/v/${note.id}`);
                }}
                key={note.id}
                className={`group flex items-center gap-4 px-5 py-4 no-underline hover:bg-surface-muted transition-colors ease-out-expo duration-150 ${
                  index !== visibleNotes.length - 1
                    ? "border-b border-divider"
                    : ""
                }`}
              >
                <DateFlag date={note.releaseDate} />
                <span className="font-mono text-[14px] font-semibold text-primary flex-1">
                  {note.title}
                </span>
                {!note.isActive && isCloudEngineerEnabled && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    Draft
                  </Badge>
                )}
              </a>
            ))
          )}
        </>
      ) : (
        <div className="divide-y divide-divider">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <SkeletonReleaseNoteRow />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReleaseNotes() {
  const navigate = useNavigate();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return (
    <Page title="Release Notes">
      {isCloudEngineerEnabled && (
        <div className="flex items-center justify-end mb-4">
          <ManageButton onClick={() => navigate("/release-notes/manage")} />
        </div>
      )}
      <ReleaseNotesList />
    </Page>
  );
}
