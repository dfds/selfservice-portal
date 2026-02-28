import React, { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import styles from "./demos.module.css";
import AppContext from "@/AppContext";

export default function DemoRegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: "This is unused", // kept for backward compatibility
    description: "",
    recordingUrl: "",
    slidesUrl: "",
    recordingDate: new Date().toISOString().split("T")[0],
  });
  const [descriptionError, setDescriptionError] = useState("");

  const changeDescription = (e) => {
    setFormData({ ...formData, description: e.target.value });
    if (e.target.value.trim() === "") {
      setDescriptionError("Description is required.");
    } else {
      setDescriptionError("");
    }
  };

  const handleRecordingDateChange = (evt) => {
    setFormData({ ...formData, recordingDate: evt.target.value });
  };

  const { addNewDemoRecording } = useContext(AppContext);

  const handleRegister = async () => {
    let valid = true;
    if (formData.description.trim() === "") {
      setDescriptionError("Description is required.");
      valid = false;
    }

    if (!valid) return;

    const payload = {
      title: formData.title,
      description: formData.description,
      recordingUrl: formData.recordingUrl,
      slidesUrl: formData.slidesUrl,
      recordingDate: formData.recordingDate,
    };

    addNewDemoRecording(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Demo Recording</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="recordingDescription">Description</Label>
            <textarea
              id="recordingDescription"
              className={styles.recordingDescriptionInput}
              placeholder="Enter a description"
              required
              value={formData.description}
              onChange={changeDescription}
            ></textarea>
            {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="register-recording-url">Recording URL</Label>
            <Input
              id="register-recording-url"
              placeholder="Enter the URL of the recording (e.g., YouTube link)"
              required
              value={formData.recordingUrl}
              onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
              maxLength={500}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="register-slides-url">Slides URL</Label>
            <Input
              id="register-slides-url"
              placeholder="Enter the URL of the slides (optional)"
              value={formData.slidesUrl}
              onChange={(e) => setFormData({ ...formData, slidesUrl: e.target.value })}
              maxLength={500}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="register-recording-date">Recording Date</Label>
            <input
              id="register-recording-date"
              type="date"
              onChange={handleRecordingDateChange}
              value={formData.recordingDate}
              className={`${styles.recordingDateInput} border rounded px-3 py-2 text-sm`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRegister}>Register Demo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
