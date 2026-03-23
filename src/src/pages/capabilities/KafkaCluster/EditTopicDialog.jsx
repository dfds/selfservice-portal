import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrackedButton } from "@/components/Tracking";

export default function EditTopicDialog({
  originalTopic,
  inProgress,
  allowedToUpdate,
  onUpdateClicked,
  onCloseClicked,
}) {
  const [topicCopy, setTopicCopy] = useState({ id: "", description: "" });
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (topicCopy.id !== originalTopic.id) {
      setTopicCopy(originalTopic);
    }
  }, [originalTopic]);

  useEffect(() => {
    setNewDescription(topicCopy.description);
  }, [topicCopy]);

  const changeDescription = (e) => {
    e.preventDefault();
    const newValue = e?.target?.value || "";
    setNewDescription(newValue);
  };

  const handleUpdateClicked = () => {
    if (onUpdateClicked) {
      onUpdateClicked({
        description: newDescription,
      });
    }
  };

  const handleCloseClicked = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
  };

  const canUpdate = newDescription !== "" && !inProgress;

  return (
    <Sheet open={true} onOpenChange={(o) => !o && handleCloseClicked()}>
      <SheetContent side="right" className="w-[30%]">
        <SheetHeader>
          <SheetTitle>Edit topic {topicCopy.name}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="Enter a description"
              required
              value={newDescription}
              onChange={changeDescription}
            />
          </div>

          <TrackedButton
            trackName="TopicEdit-Confirm"
            variation="primary"
            type="button"
            disabled={!allowedToUpdate && !canUpdate}
            submitting={inProgress}
            onClick={handleUpdateClicked}
          >
            Update
          </TrackedButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
