import styles from "./toast.module.css";
import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrackedButton } from "@/components/Tracking";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function ErrorToast({ message, title, details }) {
  const [showToast, setShowToast] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const prevOpacity = usePrevious(opacity);
  const [hide, setHide] = useState(false);
  const prevHide = usePrevious(hide);

  useEffect(() => {
    setTimeout(() => {
      setOpacity(0.8);
    }, 100);
  }, []);

  useEffect(() => {
    if (prevOpacity !== undefined && opacity === 0) {
      setTimeout(() => {
        setHide(true);
      }, 300);
    }
  }, [opacity]);

  useEffect(() => {
    if (prevHide !== undefined && hide === true) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }, [hide]);

  return (
    <>
      {showDetails && details && (
        <Dialog open={true} onOpenChange={(open) => !open && setShowDetails(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className={styles.error_body}>{details ?? "No details available"}</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {showToast && (
        <div
          className={`${styles.toast_container} ${hide ? styles.hidden : ""}`}
          style={{ opacity: opacity }}
        >
          <div className={styles.toast_close_bar}>
            <TrackedButton
              trackName="Toast-Close"
              size="small"
              variation="link"
              fillWidth="true"
              onClick={() => setOpacity(0)}
            >
              <X className={styles.close_icon} />
            </TrackedButton>
          </div>
          <div className={styles.toast_message}>{message}</div>
          {details && (
            <div>
              <TrackedButton
                trackName="Toast-ShowDetails"
                size="small"
                variation="link"
                fillWidth="true"
                onClick={() => setShowDetails(true)}
              >
                <span className={styles.toast_details_button}>Details</span>
              </TrackedButton>
            </div>
          )}
        </div>
      )}
    </>
  );
}
