import React, { useState, useEffect, useContext } from "react";
import { CardMedia, Spinner } from "@dfds-ui/react-components";
import Page from "components/Page";
import PageSection from "components/PageSection";
import SplashImage from "./repository.jpg";
import { useReleaseNotes } from "@/state/remote/queries/releaseNotes";
import { TrackedButton } from "@/components/Tracking";
import styles from "./releasenotes.module.css";
import PreAppContext from "preAppContext";
import DateFlag from "./DateFlag";
import { useNavigate } from "react-router-dom";

import "./style.scss";

function ManageButton({ onClick }) {
  return (
    <TrackedButton
      onClick={onClick}
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

  // todo: REDO this, make it use a <a> tag instead.......
  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/release-notes/v/${id}`);

  return (
    <PageSection headline={``}>
      {isFetched ? (
        <>
          {notes.length === 0 ? (
            <span>No release notes found</span>
          ) : (
            notes.map((note, index) =>
              note.isActive || isCloudEngineerEnabled ? (
                <>
                  <a
                    href={`/release-notes/v/${note.id}`}
                    onClick={(event) => {
                      // Allow ctrl/cmd + click to open in new tab
                      if (
                        event.defaultPrevented ||
                        event.button !== 0 || // not left click
                        event.metaKey ||
                        event.ctrlKey ||
                        event.altKey ||
                        event.shiftKey
                      ) {
                        return;
                      }

                      event.preventDefault();
                      clickHandler(note.id);
                    }}
                    key={note.id}
                    className={styles.rowLink}
                  >
                    <div className={styles.notePreview} key={note.id}>
                      <div className={styles.row}>
                        <DateFlag date={note.releaseDate} />
                        <h3 className={styles.title}>{note.title}</h3>
                      </div>
                    </div>
                  </a>
                  {/* Render <hr> if not the last item */}
                  {index !== notes.length - 1 && <hr />}
                </>
              ) : null,
            )
          )}
        </>
      ) : (
        <Spinner />
      )}
    </PageSection>
  );
}

export default function ReleaseNotes() {
  const navigate = useNavigate();
  const [showNewReleaseNoteDialog, setShowNewReleaseNoteDialog] =
    useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const splash = (
    <CardMedia
      aspectRatio="3:2"
      media={<img src={SplashImage} className={styles.cardMediaImage} alt="" />}
      className={styles.cardMedia}
    />
  );

  return (
    <>
      <Page
        title={
          <>
            Release notes
            {isCloudEngineerEnabled && (
              <div style={{ float: "right" }}>
                <ManageButton
                  onClick={() => navigate("/release-notes/manage")}
                />
              </div>
            )}
          </>
        }
      >
        {showNewReleaseNoteDialog && (
          <NewReleaseNoteDialog
            onClose={() => setShowNewReleaseNoteDialog(false)}
          />
        )}
        <ReleaseNotesList />
      </Page>
    </>
  );
}
