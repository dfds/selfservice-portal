import styles from "./toast.module.css";
import { Close } from "@dfds-ui/icons/system";
import { useEffect, useState, useRef } from "react";
import { Button } from "@dfds-ui/react-components";
import { Modal, ModalAction } from "@dfds-ui/modal";

/*
 * This hook is used to get the previous value of a prop or state.
 */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function Toast({ message, details }) {
  const [showToast, setShowToast] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const prevOpacity = usePrevious(opacity);
  const [hide, setHide] = useState(false);
  const prevHide = usePrevious(hide);
 
  const actions = (
    <>
      <ModalAction
        style={{ marginRight: "1rem" }}
        actionVariation="secondary"
        onClick={() => setShowDetails(false)}
      >
        Close
      </ModalAction>
    </>
  )

  useEffect(() => {
    setTimeout(() => {
      setOpacity(0.8)
    }, 100) // arbitrary delay to allow the toast to render before fading in
  }, []);

  useEffect(() => {
    if (prevOpacity != undefined && opacity === 0) {
      setTimeout(() => {
        setHide(true);
      }, 300); // 300ms is the duration of the fade-out animation
    }
  }, [opacity]);

  useEffect(() => {
    if (prevHide != undefined && hide === true) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000); // 300ms is the duration of the squeeze animation
    }
  }, [hide]);

  return (
    <>
    {showDetails && details && (
    <Modal
        heading={`Details`}
        isOpen={true}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => setShowDetails(false)}
        actions={actions}
    >
      {details ? details : "No details available"}
    </Modal>)}
    {showToast && (
    <div className={`${styles.toast_container} ${hide ? styles.hidden : ''}`} style={{"opacity": opacity}}>
        <div className={styles.toast_close_bar}>
          <Button size="small" variation="link" fillWidth="true" onClick={() => setOpacity(0)} >
            <Close className={styles.close_icon} />
          </Button>
        </div>
        <div className={styles.toast_message}>
          {message}
        </div>
        <br />
        {details && (
        <div>
          <Button size="small" variation="link" fillWidth="true" onClick={() => setShowDetails(true)}>
            <span className={styles.toast_details_button}>Details</span>
          </Button>
        </div>
        )}
    </div>
    )}
    </>
  );
}
