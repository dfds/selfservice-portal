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
import PreAppContext from "@/preAppContext";
//

export default function ReleaseNotesCreate() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return (
    <>
      {isCloudEngineerEnabled ? (
        <Page title="">
          <div className={styles.buffer}></div>

          <Editor mode={EditorMode.Create} />
        </Page>
      ) : (
        <div>Unauthorised</div>
      )}
    </>
  );
}
