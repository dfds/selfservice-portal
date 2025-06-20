import React, { useState, useMemo, useEffect, useContext } from "react";
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
import { TrackedButton, TrackedLink } from "@/components/Tracking";

//
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

export default function ReleaseNotesCreate() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  const theme = {};

  const initialEditorConfig = {
    namespace: "releasenotes",
    theme,
    onError: (err) => {
      console.log(err);
    },
  };

  return (
    <>
      <Page title="">
        <div className={styles.buffer}></div>
        <LexicalComposer initialConfig={initialEditorConfig}>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable
                placeholder={<div>Enter some text</div>}
              ></ContentEditable>
            }
          ></RichTextPlugin>
          <HistoryPlugin />
          <AutoFocusPlugin />
        </LexicalComposer>
      </Page>
    </>
  );
}
