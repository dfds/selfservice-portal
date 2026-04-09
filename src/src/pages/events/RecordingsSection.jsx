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
import { Text } from "@/components/ui/Text";
import styles from "./events.module.css";
import { TrackedButton } from "@/components/Tracking";
import PageSection from "@/components/PageSection";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import EventRecord from "./eventRecord";
import EventRegisterModal from "./EventRegisterModal";
import EventEditModal from "./EventEditModal";

export default function RecordingsSection() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { removeEvent } = useContext(AppContext);
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

  return (
    <PageSection
      id="events"
      headline="Events"
      headlineChildren={
        isCloudEngineerEnabled && (
          <TrackedButton
            trackName="RegisterEvent"
            variation="primary"
            size="small"
            style={{ marginLeft: "1rem" }}
            onClick={() => {
              setShowRegisterModal(true);
            }}
          >
            Register Event
          </TrackedButton>
        )
      }
    >
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
              <Text>Are you sure you want to delete this event?</Text>
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
        {isFetchedEvents && events.length > 0 ? (
          <div className={styles.recordingsGrid}>
            {events.map((event, index) => (
              <div key={event.id} className={styles.recordingCard}>
                <EventRecord
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
                {/* Render <hr> if not the last item */}
                {index !== events.length - 1 && <hr />}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>There are currently no events. Please check back later.</Text>
          </div>
        )}
      </>
    </PageSection>
  );
}
