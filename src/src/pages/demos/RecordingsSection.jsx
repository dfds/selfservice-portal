import React, { useState, useContext, useEffect } from "react";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { useDemos } from "@/state/remote/queries/demos";
import { Text } from "@dfds-ui/typography";
import styles from "./demos.module.css";
import { TrackedButton } from "@/components/Tracking";
import PageSection from "@/components/PageSection";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import DemoRecord from "./demoRecord";
import DemoRegisterModal from "./DemoRegisterModal";
// DemoEditModal will be created for editing
import DemoEditModal from "./DemoEditModal";

export default function RecordingsSection() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { removeDemoRecording } = useContext(AppContext);
  const [demos, setDemos] = useState([]);
  const [selectedDemoId, setSelectedDemoId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDemo, setEditDemo] = useState(null);

  const { isFetched: isFetchedRecordings, data: demosData } = useDemos();

  useEffect(() => {
    if (isFetchedRecordings) {
      demosData.sort(
        (a, b) => new Date(b.recordingDate) - new Date(a.recordingDate),
      );
      setDemos(demosData);
    }
  }, [isFetchedRecordings, demosData]);

  return (
    <PageSection
      id="recordings"
      headline="Recordings"
      headlineChildren={
        isCloudEngineerEnabled && (
          <TrackedButton
            trackName="RegisterDemoRecording"
            variation="primary"
            size="small"
            style={{ marginLeft: "1rem" }}
            onClick={() => {
              setShowRegisterModal(true);
            }}
          >
            Register Demo Recording
          </TrackedButton>
        )
      }
    >
      <>
        {showRegisterModal && (
          <DemoRegisterModal
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
          />
        )}
        {showEditModal && editDemo && (
          <DemoEditModal
            isOpen={showEditModal}
            demo={editDemo}
            onClose={() => {
              setShowEditModal(false);
              setEditDemo(null);
            }}
          />
        )}
        {showDeleteModal && (
          <Modal
            heading={"Confirm Deletion"}
            isOpen={showDeleteModal}
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={true}
            showClose={true}
            fixedTopPosition={true}
            onRequestClose={() => setShowDeleteModal(false)}
          >
            <Text>Are you sure you want to delete this demo recording?</Text>
            <br />
            <ModalAction
              style={{ float: "right", marginRight: "1rem" }}
              actionVariation="danger"
              onClick={async () => {
                removeDemoRecording(selectedDemoId);
                setSelectedDemoId(null);
                setShowDeleteModal(false);
              }}
            >
              Delete
            </ModalAction>
          </Modal>
        )}
        {isFetchedRecordings && demos.length > 0 ? (
          <div className={styles.recordingsGrid}>
            {demos.map((demo, index) => (
              <div key={demo.id} className={styles.recordingCard}>
                <DemoRecord
                  demo={demo}
                  isCloudEngineerEnabled={isCloudEngineerEnabled}
                  onDeleteClick={() => {
                    setSelectedDemoId(demo.id);
                    setShowDeleteModal(true);
                  }}
                  onEditClick={() => {
                    console.log("Edit clicked for demo:", demo);
                    setEditDemo(demo);
                    setShowEditModal(true);
                  }}
                />
                {/* Render <hr> if not the last item */}
                {index !== demos.length - 1 && <hr />}
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
            <Text>
              There are currently no recordings. Please check back later.
            </Text>
          </div>
        )}
      </>
    </PageSection>
  );
}
