import React, { useState, useEffect, useContext } from "react";
import Page from "@/components/Page";
import { TrackedButton } from "@/components/Tracking";
import styles from "./releasenotes.module.css";
import Nope from "@/components/Nope";
import "./style.scss";

import {
  useReleaseNotes,
  useToggleReleaseNoteActive,
  useDeleteReleaseNote,
} from "@/state/remote/queries/releaseNotes";
import { useNavigate } from "react-router-dom";
import { queryClient } from "@/state/remote/client";
import PreAppContext from "@/preAppContext";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { Text } from "@dfds-ui/typography";

function CreateReleaseNoteButton({ onClick }) {
  return (
    <TrackedButton
      onClick={onClick}
      trackName="ReleaseNote-CreateButtonClicked"
      trackingEvent={{
        category: "ReleaseNotes",
        action: "CreateNew",
        label: "Create Release Note",
      }}
    >
      Create Release Note
    </TrackedButton>
  );
}

function WarningDialog({ onCloseRequested, onAccept }) {
  const actions = (
    <>
      {/*ModalActions does not support danger/warning variations currently*/}
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="primary"
        onClick={onAccept}
      >
        Accept
      </ModalAction>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={onCloseRequested}
      >
        Cancel
      </ModalAction>
    </>
  );

  return (
    <>
      <Modal
        heading={`Delete Release Note`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={onCloseRequested}
        actions={actions}
      >
        <div className={styles.container}>
          <div className={styles.column}>
            <Text styledAs={"smallHeadline"}>Are you certain?</Text>{" "}
            <span className={styles.breakwords}>
              This action will delete the release note and all its content. This
              action cannot be undone.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ReleaseNotesManage() {
  const { data } = useReleaseNotes({ includeDrafts: true });
  const toggleReleaseNoteActive = useToggleReleaseNoteActive();
  const deleteReleaseNote = useDeleteReleaseNote();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  const [notes, setNotes] = useState(data?.items || []);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [noteIdUpForDeletion, setNoteIdUpForDeletion] = useState(null);

  useEffect(() => {
    if (data?.items) {
      setNotes(data.items);
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

  const handleDelete = () => {
    deleteReleaseNote.mutate(
      {
        id: noteIdUpForDeletion,
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
      {showDeleteWarning && (
        <WarningDialog
          onCloseRequested={() => {
            setNoteIdUpForDeletion(null);
            setShowDeleteWarning(false);
          }}
          onAccept={() => {
            handleDelete();
            setNoteIdUpForDeletion(null);
            setShowDeleteWarning(false);
          }}
        />
      )}
      {isCloudEngineerEnabled ? (
        <Page
          title={
            <>
              Release Notes archive
              <div style={{ float: "right" }}>
                <CreateReleaseNoteButton
                  onClick={() => navigate("/release-notes/create")}
                />
              </div>
            </>
          }
        >
          <div className="notes">
            {notes.map((elem, index) => {
              return (
                <>
                  <div className="note" key={elem.id}>
                    <div className="view">
                      <span className="title">{elem.title}</span>
                      <div className="metadata">
                        <span>release date: {elem.releaseDate}</span>
                        <span>created date: {elem.createdAt}</span>
                        <span>modified date: {elem.modifiedAt}</span>
                        <span>author: {elem.createdBy}</span>
                        <span>published: {elem.isActive ? "yes" : "no"}</span>
                      </div>
                    </div>
                    <div className="manage">
                      {elem._links?.toggleIsActive && (
                        <span style={{ marginRight: "5px" }}>
                          <TrackedButton
                            trackName="ReleaseNote-ToggleActiveButtonClicked"
                            onClick={() => {
                              handleToggleActive(elem.id);
                            }}
                            style={{
                              backgroundColor: elem.isActive
                                ? "#edd853"
                                : "#9ee55b",
                              width: "100px",
                            }}
                            trackingEvent={{
                              category: "ReleaseNotes",
                              action: "ToggleActive",
                              label: elem.isActive ? "Unpublish" : "Publish",
                            }}
                          >
                            {elem.isActive ? "Unpublish" : "Publish"}
                          </TrackedButton>
                        </span>
                      )}
                      <span style={{ marginRight: "5px" }}>
                        <TrackedButton
                          trackName="ReleaseNote-EditButtonClicked"
                          onClick={() => {
                            clickHandler(elem.id);
                          }}
                          style={{ width: "100px" }}
                          trackingEvent={{
                            category: "ReleaseNotes",
                            action: "View",
                            label: `Edit Release Note: ${elem.id}`,
                          }}
                        >
                          Edit
                        </TrackedButton>
                      </span>
                      {elem._links?.remove && (
                        <span style={{ marginRight: "5px" }}>
                          <TrackedButton
                            trackName="ReleaseNote-DeleteButtonClicked"
                            onClick={() => {
                              setNoteIdUpForDeletion(elem.id);
                              setShowDeleteWarning(true);
                            }}
                            style={{
                              backgroundColor: "#dd6868",
                              width: "100px",
                            }}
                            trackingEvent={{
                              category: "ReleaseNotes",
                              action: "Delete",
                              label: "Delete Release Note",
                            }}
                          >
                            Delete
                          </TrackedButton>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Render <hr> if not the last item */}
                  {index !== notes.length - 1 && <hr />}
                </>
              );
            })}
          </div>
        </Page>
      ) : (
        <Nope />
      )}
    </>
  );
}

export default ReleaseNotesManage;
