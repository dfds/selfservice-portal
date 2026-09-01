import React, { useContext } from "react";
import Page from "@/components/Page";
import Nope from "@/components/Nope";
import "./style.scss";

import { Editor, EditorMode } from "./editor/editor";
import PreAppContext from "@/preAppContext";

export default function ReleaseNotesCreate() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  return (
    <>
      {isCloudEngineerEnabled ? (
        <Page title="">
          <Editor mode={EditorMode.Create} />
        </Page>
      ) : (
        <Nope />
      )}
    </>
  );
}
