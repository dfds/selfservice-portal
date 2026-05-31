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
  combineLocalDateTimeToUtc,
  splitLocalDateAndTime,
} from "./eventDateTime";
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

export default function EventEditModal({ isOpen, onClose, event }) {
  const { editEvent } = useContext(AppContext);

  const seedFromEvent = (ev) => {
    const fallbackDate = new Date().toISOString().split("T")[0];
    const { date, time } = ev.eventDate
      ? splitLocalDateAndTime(ev.eventDate)
      : { date: "", time: "" };
    return {
      title: ev.title || "",
      description: ev.description || "",
      eventDate: date || fallbackDate,
      eventTime: time || "09:00",
      type: ev.type || "Demo",
      attachments: ev.attachments || [],
    };
  };

  const [formData, setFormData] = useState(() => seedFromEvent(event));
  const [descriptionError, setDescriptionError] = useState("");
  const [timeError, setTimeError] = useState("");

  // Reset form data when event changes
  useEffect(() => {
    setFormData(seedFromEvent(event));
    setDescriptionError("");
    setTimeError("");
  }, [event]);

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

  const handleEventTimeChange = (evt) => {
    const value = evt.target.value;
    setFormData({ ...formData, eventTime: value });
    setTimeError(value ? "" : "Time is required.");
  };

  const addAttachment = () => {
    setFormData({
      ...formData,
      attachments: [
        ...formData.attachments,
        { url: "", type: "Recording", description: "" },
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

  const handleSave = async () => {
    let valid = true;
    if (formData.description.trim() === "") {
      setDescriptionError("Description is required.");
      valid = false;
    }
    if (!formData.eventTime) {
      setTimeError("Time is required.");
      valid = false;
    }

    if (!valid) return;

    const payload = {
      id: event.id,
      title: formData.title,
      description: formData.description,
      eventDate: combineLocalDateTimeToUtc(formData.eventDate, formData.eventTime),
      type: formData.type,
      attachments: formData.attachments.filter((a) => a.url.trim() !== ""),
    };

    editEvent(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="editEventTitle">Title (optional)</Label>
            <Input
              id="editEventTitle"
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <Label htmlFor="edit-event-date">Event Date</Label>
              <input
                id="edit-event-date"
                type="date"
                onChange={handleEventDateChange}
                value={formData.eventDate}
                className={`${styles.recordingDateInput} border rounded px-3 py-2 text-sm`}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label htmlFor="edit-event-time">Event Time</Label>
              <input
                id="edit-event-time"
                type="time"
                onChange={handleEventTimeChange}
                value={formData.eventTime}
                required
                className={`${styles.recordingDateInput} border rounded px-3 py-2 text-sm`}
              />
              {timeError && (
                <p className="text-xs text-red-500">{timeError}</p>
              )}
            </div>
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
                    value={attachment.type}
                    onChange={(e) =>
                      updateAttachment(index, "type", e.target.value)
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
                    value={attachment.description || ""}
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
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
