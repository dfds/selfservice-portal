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
import styles from "./releasenotes.module.css";
import PreAppContext from "preAppContext";
import AppContext from "AppContext";
import DateFlag from "./DateFlag";
import { useNavigate } from "react-router-dom";

import "./style.scss";

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
      {isCloudEngineerEnabled && (
        <div className="manage" style={{ marginBottom: "5px" }}>
          <div
            className="button"
            onClick={() => {
              navigate("/release-notes/manage");
            }}
          >
            Manage content
          </div>
        </div>
      )}

      {isFetched ? (
        notes.map((note) =>
          note.isActive || isCloudEngineerEnabled ? (
            <div
              className={styles.notePreview}
              key={note.id}
              onClick={() => clickHandler(note.id)}
            >
              <div className={styles.row}>
                <DateFlag date={note.releaseDate} />
                <h3 className={styles.title}>{note.title}</h3>
              </div>
              <hr className={styles.divider} />
            </div>
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
        <ReleaseNotesList />
      </Page>
    </>
  );
}
