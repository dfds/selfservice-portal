import styles from "./toast.module.css";
import { X } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrackedButton } from "@/components/Tracking";

export default function ErrorToast({ message, title, details }) {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const dismiss = () => setIsExiting(true);

  const handleAnimationEnd = () => {
    if (isExiting) setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {showDetails && details && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setShowDetails(false)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className={styles.error_body}>
              {details ?? "No details available"}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div
        className={`fixed bottom-4 right-4 z-[100] w-[290px] rounded-[5px] bg-[var(--color-error)] ${
          isExiting ? "animate-toast-exit" : "animate-toast-enter"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="w-full h-8 flex items-center justify-end pr-1">
          <TrackedButton
            trackName="Toast-Close"
            size="small"
            variation="link"
            onClick={dismiss}
            className="text-white hover:text-white/80 h-7 w-7 p-0"
          >
            <X size={15} strokeWidth={2} />
          </TrackedButton>
        </div>
        <div className="text-white text-center px-5 pb-2 text-sm">
          {message}
        </div>
        {details && (
          <div className="text-center pb-3">
            <TrackedButton
              trackName="Toast-ShowDetails"
              size="small"
              variation="link"
              onClick={() => setShowDetails(true)}
              className="text-white/70 hover:text-white text-[0.8rem] h-auto py-0.5"
            >
              Details
            </TrackedButton>
          </div>
        )}
      </div>
    </>
  );
}
