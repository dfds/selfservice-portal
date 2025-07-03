import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  CardMedia,
  Spinner,
} from "@dfds-ui/react-components";
import Page from "components/Page";
import PageSection from "components/PageSection";
import SplashImage from "./repository.jpg";
import { useReleaseNotes } from "@/state/remote/queries/releaseNotes";
import { TrackedButton, TrackedLink } from "@/components/Tracking";
import NewReleaseNoteDialog from "./NewReleaseNoteDialog";
import styles from "./releasenotes.module.css";
import PreAppContext from "preAppContext";
import AppContext from "AppContext";
import DateFlag from "./DateFlag";

function ReleaseNotesList() {
  const { isFetched, data } = useReleaseNotes({});
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { toggleReleaseNoteIsActive } = useContext(AppContext);

  const [notes, setNotes] = useState(data?.items || []);
  useEffect(() => {
    if (data?.items) {
      setNotes(data.items);
    }
  }, [data]);

  function toggleIsActive(note) {
    notes.map((n) => {
      if (n.id === note.id) {
        n.isActive = !n.isActive;
      }
      return n;
    });
    setNotes([...notes]);

    toggleReleaseNoteIsActive(note);
  }

  return (
    <PageSection headline={`Release Notes`}>
      {isFetched ? (
        notes.map((note) =>
          note.isActive || isCloudEngineerEnabled ? (
            <>
              <div key={note.id}>
                <div className={styles.row}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    id={note.id}
                    name={note.id}
                    checked={note.isActive}
                    hidden={!isCloudEngineerEnabled}
                    onChange={() => toggleIsActive(note)}
                  ></input>
                  <DateFlag date={note.releaseDate} />
                  <h3 className={styles.title}>{note.title}</h3>
                </div>
                <p className={styles.content}>{note.content}</p>
              </div>
              <hr className={styles.divider} />
            </>
          ) : null,
        )
      ) : (
        <Spinner />
      )}
    </PageSection>
  );
}

export default function ReleaseNotes() {
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
      <Page title="Release notes">
        {showNewReleaseNoteDialog && (
          <NewReleaseNoteDialog
            onClose={() => setShowNewReleaseNoteDialog(false)}
          />
        )}
        <PageSection>
          <Card
            variant="fill"
            surface="main"
            size="xl"
            reverse={true}
            media={splash}
          >
            <CardTitle largeTitle>Information</CardTitle>
            <CardContent>
              <p>Something Something description of the release notes page.</p>
            </CardContent>
            {isCloudEngineerEnabled && (
              <CardActions>
                <TrackedButton
                  trackName="ShowNewReleaseNoteDialog"
                  size="small"
                  onClick={() => setShowNewReleaseNoteDialog(true)}
                >
                  New release note
                </TrackedButton>
              </CardActions>
            )}
          </Card>
        </PageSection>
        <ReleaseNotesList />
      </Page>
    </>
  );
}
