import React, { useState, useContext, useEffect } from "react";
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
import styles from "./events.module.css";
import AppContext from "@/AppContext";
import {
  X,
  Plus,
  FileText,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

const EVENT_TYPES = ["Demo", "Workshop", "Informational", "Other"];
const ATTACHMENT_TYPES = ["Document", "Recording", "Image", "Other"];

export default function EventRegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: new Date().toISOString().split("T")[0],
    type: "Demo",
    attachments: [],
  });
  const [descriptionError, setDescriptionError] = useState("");

  // Reset form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        eventDate: new Date().toISOString().split("T")[0],
        type: "Demo",
        attachments: [],
      });
      setDescriptionError("");
    }
  }, [isOpen]);

  const changeDescription = (e) => {
    setFormData({ ...formData, description: e.target.value });
    if (e.target.value.trim() === "") {
      setDescriptionError("Description is required.");
    } else {
      setDescriptionError("");
    }
  };

  const handleEventDateChange = (evt) => {
    setFormData({ ...formData, eventDate: evt.target.value });
  };

  const addAttachment = () => {
    setFormData({
      ...formData,
      attachments: [
        ...formData.attachments,
        { url: "", attachmentType: "Recording", description: "" },
      ],
    });
  };

  const removeAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const updateAttachment = (index, field, value) => {
    const updated = [...formData.attachments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, attachments: updated });
  };

  const { addNewEvent } = useContext(AppContext);

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
      eventDate: formData.eventDate,
      type: formData.type,
      attachments: formData.attachments.filter((a) => a.url.trim() !== ""),
    };

    addNewEvent(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Event</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="eventTitle">Title (optional)</Label>
            <Input
              id="eventTitle"
              placeholder="Enter a title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="eventDescription">Description</Label>
            <textarea
              id="eventDescription"
              className={styles.recordingDescriptionInput}
              placeholder="Enter a description"
              required
              value={formData.description}
              onChange={changeDescription}
            ></textarea>
            {descriptionError && (
              <p className="text-xs text-red-500">{descriptionError}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="event-type">Event Type</Label>
            <select
              id="event-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="register-event-date">Event Date</Label>
            <input
              id="register-event-date"
              type="date"
              onChange={handleEventDateChange}
              value={formData.eventDate}
              className={`${styles.recordingDateInput} border rounded px-3 py-2 text-sm`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAttachment}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Attachment
              </Button>
            </div>
            {formData.attachments.map((attachment, index) => (
              <div
                key={index}
                className="border rounded p-3 flex flex-col gap-2 relative"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`attachment-url-${index}`}>URL</Label>
                  <Input
                    id={`attachment-url-${index}`}
                    placeholder="Enter URL"
                    value={attachment.url}
                    onChange={(e) =>
                      updateAttachment(index, "url", e.target.value)
                    }
                    maxLength={500}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`attachment-type-${index}`}>Type</Label>
                  </div>
                  <select
                    id={`attachment-type-${index}`}
                    value={attachment.attachmentType}
                    onChange={(e) =>
                      updateAttachment(index, "attachmentType", e.target.value)
                    }
                    className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    {ATTACHMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`attachment-description-${index}`}>
                    Description (optional)
                  </Label>
                  <Input
                    id={`attachment-description-${index}`}
                    placeholder="Enter description"
                    value={attachment.description}
                    onChange={(e) =>
                      updateAttachment(index, "description", e.target.value)
                    }
                    maxLength={200}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={handleRegister}>Register Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
