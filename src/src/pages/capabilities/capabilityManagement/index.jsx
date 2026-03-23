import React, { useContext } from "react";
import PageSection from "@/components/PageSection";
import { Text } from "@/components/ui/Text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { useState } from "react";
import AppContext from "../../../AppContext";
import { TrackedButton } from "@/components/Tracking";

function DeleteDialog({ onCloseRequested, onDeleteClicked }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCloseRequested()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you certain you wish to delete this capability?
          </DialogTitle>
        </DialogHeader>
        <Text>
          <strong>Warning:</strong> You are about to request deletion of this
          capability. Deletion will commence after a 7 day period, during which
          it is possible to cancel the deletion request. Be aware, that all
          resources related to this capability will be removed permanently, once
          deletion begins.
        </Text>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end mt-2">
          <Button variant="outline" onClick={onCloseRequested}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDeleteClicked}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CapabilityManagement({ anchorId }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    links,
    submitDeleteCapability,
    isPendingDeletion,
    updateDeletionStatus,
  } = useContext(SelectedCapabilityContext);

  const { reloadUser } = useContext(AppContext);

  const canDeleteCapability = (
    links?.requestCapabilityDeletion?.allow || []
  ).includes("POST");

  const handleDeleteClicked = async () => {
    await submitDeleteCapability();
    updateDeletionStatus(true);
    setShowDeleteDialog(false);
    reloadUser();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {canDeleteCapability && (
        <PageSection id={anchorId} headline="Capability Management">
          {showDeleteDialog && (
            <DeleteDialog
              onCloseRequested={() => {
                setShowDeleteDialog(false);
              }}
              onDeleteClicked={handleDeleteClicked}
            />
          )}
          <div className="border border-[rgba(217,48,37,0.2)] dark:border-[rgba(217,48,37,0.4)] rounded-[6px] p-4 bg-[rgba(217,48,37,0.04)] dark:bg-[rgba(217,48,37,0.1)]">
            {!isPendingDeletion && (
              <>
                <TrackedButton
                  trackName="CapabilityDelete-ShowDialog"
                  variation="danger"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Request deletion
                </TrackedButton>
                <p className="text-[12px] text-[#b91c1c] leading-[1.55] mt-3">
                  Requesting deletion will not immediately remove the capability
                  or its resources. Deletion commences after a 7 day period,
                  during which the request can be cancelled.
                </p>
              </>
            )}
            {isPendingDeletion && (
              <p className="text-[13px] text-[#666666] dark:text-slate-400">
                Deletion of this capability is pending. No other management
                actions are available at this time.
              </p>
            )}
          </div>
        </PageSection>
      )}
    </>
  );
}
