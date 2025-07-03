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
import { Editor } from "./editor/editor";
import {
  useReleaseNotes,
  useToggleReleaseNoteActive,
} from "@/state/remote/queries/releaseNotes";
import { useNavigate } from "react-router-dom";
import { queryClient } from "@/state/remote/client";

//

export function ReleaseNotesManage() {
  const { isFetched, data } = useReleaseNotes({ includeDrafts: true });
  const toggleReleaseNoteActive = useToggleReleaseNoteActive();

  const [notes, setNotes] = useState(data?.items || []);
  useEffect(() => {
    if (data?.items) {
      setNotes(data.items);
      console.log(data.items);
    }
  }, [data]);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/release-notes/edit/${id}`);

  const handleToggleActive = (id) => {
    toggleReleaseNoteActive.mutate(
      {
        id: id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
        },
      },
    );
  };

  return (
    <>
      <Page title="">
        <div className={styles.buffer}></div>

        <div className="notes">
          {notes.map((elem) => {
            return (
              <div className="note" key={elem.id}>
                <div className="view">
                  <span className="title">{elem.title}</span>
                  <div className="metadata">
                    <span>created date: {elem.createdAt}</span>
                    <span>modified date: {elem.modifiedAt}</span>
                    <span>author: {elem.createdBy}</span>
                    <span>published: {elem.isActive ? "yes" : "no"}</span>
                  </div>
                </div>
                <div className="manage">
                  <div
                    className="button"
                    onClick={() => {
                      clickHandler(elem.id);
                    }}
                  >
                    Edit
                  </div>
                  <div
                    className="button"
                    style={{
                      backgroundColor: elem.isActive ? "#edd853" : "#9ee55b",
                    }}
                    onClick={() => {
                      handleToggleActive(elem.id);
                    }}
                  >
                    {elem.isActive ? "Unpublish" : "Publish"}
                  </div>
                  <div
                    className="button"
                    style={{ backgroundColor: "#dd6868" }}
                  >
                    Delete
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Page>
    </>
  );
}

export default ReleaseNotesManage;
