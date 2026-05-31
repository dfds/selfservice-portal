import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/state/remote/queries/events";
import { useTopBarActions } from "@/components/TopBar/TopBarActionsContext";
import { TrackedButton } from "@/components/Tracking";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import EventRecord from "./eventRecord";
import EventRegisterModal from "./EventRegisterModal";
import EventEditModal from "./EventEditModal";

export default function RecordingsSection() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { removeEvent } = useContext(AppContext);
  const { setActions } = useTopBarActions();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const { isFetched: isFetchedEvents, data: eventsData } = useEvents();

  useEffect(() => {
    if (isFetchedEvents) {
      const sorted = [...eventsData].sort(
        (a, b) => new Date(b.eventDate) - new Date(a.eventDate),
      );
      setEvents(sorted);
    }
  }, [isFetchedEvents, eventsData]);

  useEffect(() => {
    if (!isCloudEngineerEnabled) {
      setActions(null);
      return;
    }
    setActions(
      <TrackedButton
        trackName="RegisterEvent"
        size="sm"
        onClick={() => setShowRegisterModal(true)}
      >
        Register Event
      </TrackedButton>,
    );
    return () => setActions(null);
  }, [isCloudEngineerEnabled]);

  return (
    <>
      {showRegisterModal && (
        <EventRegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
      {showEditModal && editEvent && (
        <EventEditModal
          isOpen={showEditModal}
          event={editEvent}
          onClose={() => {
            setShowEditModal(false);
            setEditEvent(null);
          }}
        />
      )}
      {showDeleteModal && (
        <Dialog
          open={showDeleteModal}
          onOpenChange={(o) => !o && setShowDeleteModal(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-[13px] text-secondary leading-relaxed">
              Are you sure you want to delete this event?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  removeEvent(selectedEventId);
                  setSelectedEventId(null);
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isFetchedEvents && events.length === 0 ? (
        <div className="bg-surface border border-card rounded-[8px] px-5 py-12 text-center">
          <p className="text-[14px] text-muted font-mono">
            There are currently no events. Please check back later.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-card rounded-[8px] overflow-hidden">
          {events.map((event) => (
            <EventRecord
              key={event.id}
              event={event}
              isCloudEngineerEnabled={isCloudEngineerEnabled}
              onDeleteClick={() => {
                setSelectedEventId(event.id);
                setShowDeleteModal(true);
              }}
              onEditClick={() => {
                setEditEvent(event);
                setShowEditModal(true);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
