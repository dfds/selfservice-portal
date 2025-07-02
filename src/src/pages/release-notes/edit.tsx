import React, { useState, useMemo, useEffect, useContext, useRef } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Card,
  CardTitle,
  CardContent,
  CardActions,
  CardMedia,
  Spinner,
} from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { Modal, ModalAction } from "@dfds-ui/modal";
import Page from "components/Page";
import PageSection from "components/PageSection";
import styles from "./releasenotes.module.css";
import "./style.scss";

import { TrackedButton, TrackedLink } from "@/components/Tracking";
import { Editor, EditorMode } from "./editor/editor";
import { useReleaseNote } from "@/state/remote/queries/releaseNotes";
import { useParams } from "react-router-dom";

//

export function ReleaseNotesEdit() {
  const { id } = useParams();
  const { isFetched, data } = useReleaseNote(id);
  const [content, setContent] = useState({});
  const [doc, setDoc] = useState({});
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (data != null) {
      console.log(data);
      const parsed = JSON.parse(data.content);
      setDoc(data);
      setContent(parsed);
      setContentReady(true);
    }
  }, [isFetched]);

  return (
    <>
      <Page title="">
        <div className={styles.buffer}></div>

        {contentReady && (
          <Editor defaultContent={content} mode={EditorMode.Edit} doc={doc} />
        )}
      </Page>
    </>
  );
}

export default ReleaseNotesEdit;
