import React, { useState } from "react";
import {
  Banner,
  BannerParagraph,
  Button,
  TextField,
} from "@/components/dfds-ui/react-components";
import { Modal } from "@/components/dfds-ui/modal";
import { StatusWarning as WarningIcon } from "@dfds-ui/icons/system";
import styles from "./DeleteTopicDialog.module.css";

export default function DeleteTopicDialog({
  topicName,
  inProgress,
  allowedToDelete,
  onDeleteClicked,
  onCancelClicked,
}) {
  const [topicToDelete, setTopicToDelete] = useState("");
  const canDelete = topicToDelete === topicName;
  const isPublic = topicName.startsWith("pub.");

  return (
    <Modal
      heading={`Delete ${topicName}`}
      isOpen={true}
      onRequestClose={onCancelClicked}
    >
      {isPublic && !allowedToDelete ? (
        <>
          <p>
            Before initiating the deletion process, it is crucial to verify that
            there are no active users relying on the topic, as it may result in
            unfavorable outcomes for those who depend on it.
          </p>
          <p>
            Deleting <strong>public topics</strong> can potentially have
            unfortunate consequences for other systems that you are not aware of
            nor have responsibility for.
          </p>
          <Banner icon={WarningIcon} variant="lowEmphasis">
            <BannerParagraph>
              It is very important that you have notified any active consumers
              before proceeding.
            </BannerParagraph>
          </Banner>
          <p>
            Deleting <strong>public topics</strong> is currently only available
            for cloud engineers in the Cloud Engineering department. You need to
            request the deletion by creating a ticket via email to{" "}
            <a href="mailto:cloud.engineering@dfds.com">
              cloud.engineering@dfds.com
            </a>
          </p>
        </>
      ) : (
        <>
          <p>
            Before proceeding with the deletion, ensure that there are no active
            consumers for the topic, as it can lead to unfortunate consequences
            for those who rely on that specific topic.
          </p>
          <p>
            To provide an additional safety measure, we kindly request that you
            enter the complete name of the topic you wish to delete.
          </p>

          <TextField
            label="Topic Name"
            placeholder={`${topicName}`}
            required
            value={topicToDelete}
            onChange={(e) => setTopicToDelete(e?.target?.value)}
          />

          <p>
            <i>
              <strong>Please be aware</strong> that all messages related to the
              topic will be permanently deleted, and this action cannot be
              undone.
            </i>
          </p>

          <div className={styles.confirmdialogbuttonscontainer}>
            <Button
              className={styles.dangerbutton}
              variation="danger"
              disabled={!canDelete}
              submitting={inProgress}
              onClick={onDeleteClicked}
            >
              Delete
            </Button>
            <Button
              variation="outlined"
              submitting={inProgress}
              onClick={onCancelClicked}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
