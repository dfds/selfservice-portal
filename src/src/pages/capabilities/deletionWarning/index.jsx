import React, { useContext } from "react";
import { useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { Button } from "@/components/ui/button";

export default function DeletionWarning() {
  const [visible, setVisible] = useState(true);
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
    setVisible(false);
    reloadUser();
    setTimeout(() => {
      updateDeletionStatus(false);
      setVisible(true);
    }, 500);
  };

  if (!isPendingDeletion) return null;

  return (
    <div
      className="mb-6 border border-[rgba(190,30,45,0.3)] dark:border-[rgba(190,30,45,0.5)] rounded-[8px] bg-[rgba(190,30,45,0.05)] dark:bg-[rgba(190,30,45,0.12)] p-4 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-[#be1e2d] mb-2">
        Warning: Pending Deletion
      </div>
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        A member of this capability has requested that it be deleted. Deletion
        has not commenced yet and it is still possible to cancel this request.
        Once deletion commences, all resources related to this capability will
        be removed permanently.
      </p>
      {canCancelDeleteCapability && (
        <Button variant="outline" size="sm" onClick={handleCancelDeleteClicked}>
          Cancel Deletion
        </Button>
      )}
    </div>
  );
}
