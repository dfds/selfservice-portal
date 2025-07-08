import React, { useState, useEffect, useContext } from "react";
import Page from "components/Page";
import styles from "./releasenotes.module.css";
import "./style.scss";

import { Editor, EditorMode } from "./editor/editor";
import { useReleaseNote } from "@/state/remote/queries/releaseNotes";
import { useParams } from "react-router-dom";
import PreAppContext from "@/preAppContext";

export function ReleaseNotesEdit() {
  const { id } = useParams();
  const { isFetched, data } = useReleaseNote(id);
  const [content, setContent] = useState({});
  const [doc, setDoc] = useState({});
  const [contentReady, setContentReady] = useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

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
      {isCloudEngineerEnabled ? (
        <Page title="">
          <div className={styles.buffer}></div>

          {contentReady && (
            <Editor defaultContent={content} mode={EditorMode.Edit} doc={doc} />
          )}
        </Page>
      ) : (
        <div>Unauthorised</div>
      )}
    </>
  );
}

export default ReleaseNotesEdit;
