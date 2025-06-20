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

//
import Quill from "quill";
import Editor from "./editor/editor2";
const Delta = Quill.import("delta");

export default function ReleaseNotesCreate() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  return (
    <>
      <Page title="">
        <div className={styles.buffer}></div>

        <Editor />

        {/* <div>
          <Editor
            ref={quillRef}
            readOnly={readOnly}
            defaultValue={new Delta()
              .insert("Hello")
              .insert("\n", { header: 1 })
              .insert("Some ")
              .insert("initial", { bold: true })
              .insert(" ")
              .insert("content", { underline: true })
              .insert("\n")}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
          />
          <div className="controls">
            <label>
              Read Only:{" "}
              <input
                type="checkbox"
                value={readOnly as any}
                onChange={(e) => setReadOnly(e.target.checked)}
              />
            </label>
            <button
              className="controls-right"
              type="button"
              onClick={() => {
                alert((quillRef as any).current?.getLength());
              }}
            >
              Get Content Length
            </button>
          </div>
          <div className="state">
            <div className="state-title">Current Range:</div>
            {range ? JSON.stringify(range) : "Empty"}
          </div>
          <div className="state">
            <div className="state-title">Last Change:</div>
            {lastChange ? JSON.stringify((lastChange as any).ops) : "Empty"}
          </div>
        </div> */}
      </Page>
    </>
  );
}
