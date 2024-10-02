import React, { useContext } from "react";
import { CardContent, ButtonStack } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { css } from "@emotion/react";
import styles from "./warning.module.css";
import AppContext from "../../../AppContext";

export default function DeletionWarning() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(true);
  const {
    isPendingDeletion,
    updateDeletionStatus,
    links,
    submitCancelDeleteCapability,
  } = useContext(SelectedCapabilityContext);

  const { reloadUser } = useContext(AppContext);

  const canCancelDeleteCapability = (
    links?.cancelCapabilityDeletionRequest?.allow || []
  ).includes("POST");

  const handleCancelDeleteClicked = async () => {
    await submitCancelDeleteCapability();
    setShowDeleteDialog(false);
    reloadUser();
    setTimeout(() => {
      updateDeletionStatus(false);
      setShowDeleteDialog(true);
    }, 500); // Change the delay value as needed (e.g., 500ms)
  };
  return (
    <>
      {/*Cards does not support danger/warning variations currently*/}
      {/*Banners are not quite flexible for what we want right now*/}
      {isPendingDeletion && (
        <div
          className={`${styles.cardLike} ${styles.spacing} ${
            styles.warningBorder
          } ${styles.alertFill} ${styles.fadeOutElement} ${
            showDeleteDialog ? "" : "fadeOut"
          }`}
        >
          <CardContent>
            <Text styledAs="sectionHeadline" className={styles.warningHeader}>
              Warning: Pending Deletion
            </Text>
            <p className={styles.warningContent}>
              A member of this capability has requested that it be deleted.
              Deletion has not commenced yet, and it is still possible to cancel
              this deletion request. Once deletion commences, it will not be
              possible to cancel it and all resources related to this capability
              will be removed permanently.
            </p>
            <div style={{ paddingTop: "2rem" }}>
              {canCancelDeleteCapability && (
                <ButtonStack align="right">
                  {
                    <button
                      className={styles.goodButton}
                      css={css`
                        :hover {
                          cursor: pointer;
                        }
                      `}
                      onClick={() => handleCancelDeleteClicked()}
                    >
                      Cancel Deletion
                    </button>
                  }
                </ButtonStack>
              )}
            </div>
          </CardContent>
        </div>
      )}
    </>
  );
}
