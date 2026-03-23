import React, { useContext, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PageSection from "@/components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { TextBlock } from "@/components/Text";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { MyMembershipApplication } from "../membershipapplications";
import AppContext from "@/AppContext";
import { TrackedButton } from "@/components/Tracking";
import { sleep } from "../../../Utils";

function JoinDialog({
  name,
  isSubmitting,
  onCloseRequested,
  onSubmitClicked,
  canBypassMembershipApplications,
  onBypassClicked,
}) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onCloseRequested()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Want to join...?</DialogTitle>
        </DialogHeader>
        <Text>
          <strong>Hey</strong>, so you wanna join <TextBlock>{name}</TextBlock>
          ...? Awesome! Apply for a membership by submitting your membership
          application for approval by existing capability members. When they
          approve, you become a member.
        </Text>
        <Text styledAs="caption">
          <i>
            <strong>Please note</strong> <br />
            Your membership application will expire after two weeks if it hasn't
            been approved by existing members.
          </i>
        </Text>
        <DialogFooter className="gap-2">
          {canBypassMembershipApplications && (
            <TrackedButton
              trackName="CapabilityMembership-ForceJoin"
              variant="destructive"
              className="sm:mr-auto"
              disabled={isSubmitting}
              onClick={onBypassClicked}
            >
              FORCE JOIN (CE)
            </TrackedButton>
          )}
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={onCloseRequested}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmitClicked}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeaveDialog({ name, isLeaving, onCloseRequested, onLeaveClicked }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onCloseRequested()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to leave {name}?</DialogTitle>
        </DialogHeader>
        <Text>
          <strong>Hey</strong>, so you wanna leave <TextBlock>{name}</TextBlock>
          ...? Are you sure? You will have to reapply for membership to regain
          access.
        </Text>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLeaving}
            onClick={onCloseRequested}
          >
            Cancel
          </Button>
          <Button disabled={isLeaving} onClick={onLeaveClicked}>
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Summary({ anchorId }) {
  const {
    name,
    createdAt,
    createdBy,
    id,
    description,
    links,
    submitMembershipApplication,
    submitLeaveCapability,
    bypassMembershipApproval,
    reloadCapability,
  } = useContext(SelectedCapabilityContext);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  var canJoin = (links?.membershipApplications?.allow || []).includes("POST");
  var canLeave = (links?.leaveCapability?.allow || []).includes("POST");
  var canBypass = (links?.joinCapability?.allow || []).includes("POST");
  const { reloadUser } = useContext(AppContext);

  useEffect(() => {
    canJoin = (links?.membershipApplications?.allow || []).includes("POST");
    canLeave = (links?.leaveCapability?.allow || []).includes("POST");
    canBypass = (links?.joinCapability?.allow || []).includes("POST");
  }, [links]);

  const handleSubmitClicked = async () => {
    setIsSubmitting(true);
    await submitMembershipApplication();
    setIsSubmitting(false);
    setShowJoinDialog(false);
  };

  const handleLeaveClicked = async () => {
    setIsLeaving(true);
    await submitLeaveCapability();
    await sleep(200);
    reloadUser();
    reloadCapability();
    setIsLeaving(false);
    setShowLeaveDialog(false);
  };

  const handleCloseRequested = () => {
    if (!isSubmitting) {
      setShowJoinDialog(false);
    }
  };

  const handleBypassClicked = async () => {
    await bypassMembershipApproval();
    await sleep(200);
    reloadUser();
    reloadCapability();
    setShowJoinDialog(false);
  };

  const asDate = (dateString) => {
    let millis = Date.parse(dateString);
    let date = new Date(millis);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const actionButtons = (
    <div className="flex gap-2 items-center">
      <MyMembershipApplication />
      {canJoin && (
        <TrackedButton
          trackName="CapabilityMembership-SendApplication"
          size="small"
          onClick={() => setShowJoinDialog(true)}
        >
          Join
        </TrackedButton>
      )}
      {canLeave && (
        <TrackedButton
          trackName="CapabilityMembership-Leave"
          variation="outlined"
          size="small"
          onClick={() => setShowLeaveDialog(true)}
        >
          Leave
        </TrackedButton>
      )}
    </div>
  );

  return (
    <PageSection
      id={anchorId}
      headline="Summary"
      headlineChildren={canJoin || canLeave ? actionButtons : null}
    >
      {showJoinDialog && (
        <JoinDialog
          name={name}
          isSubmitting={isSubmitting}
          onCloseRequested={handleCloseRequested}
          onSubmitClicked={handleSubmitClicked}
          canBypassMembershipApplications={canBypass}
          onBypassClicked={handleBypassClicked}
        />
      )}
      {showLeaveDialog && (
        <LeaveDialog
          name={name}
          isLeaving={isLeaving}
          onCloseRequested={() => {
            if (!isLeaving) {
              setShowLeaveDialog(false);
            }
          }}
          onLeaveClicked={handleLeaveClicked}
        />
      )}

      <div
        className="grid gap-x-4 gap-y-[0.625rem] items-start"
        style={{ gridTemplateColumns: "140px 1fr" }}
      >
        <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] pt-[2px]">
          Name
        </span>
        <span className="font-mono text-[12px] text-[#002b45] dark:text-[#e2e8f0] break-all">
          {name}
        </span>

        <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] pt-[2px]">
          Root ID
        </span>
        <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 break-all">
          {id}
        </span>

        <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] pt-[2px]">
          Created
        </span>
        <span className="text-[13px] text-[#666666] dark:text-slate-400">
          {createdAt ? asDate(createdAt) : "—"}
          {createdBy && (
            <>
              , by{" "}
              <span className="font-mono text-[12px] dark:text-slate-400">
                {createdBy}
              </span>
            </>
          )}
        </span>

        {description && (
          <>
            <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] pt-[2px]">
              Description
            </span>
            <span className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.5] break-words">
              {description}
            </span>
          </>
        )}
      </div>
    </PageSection>
  );
}
