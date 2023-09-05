import styles from "./toast.module.css";
import { Close } from "@dfds-ui/icons/system";
import { useState } from "react";
import { Button } from "@dfds-ui/react-components";

export default function Toast({ message }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container_toast}>
      <div className={styles.container_toast_message}>
        <div className={styles.textbox}>{message}</div>
        <div className={styles.actionbox}>
          <div onClick={() => setIsOpen(false)}>
            <Close />
          </div>
        </div>
      </div>
      <div>
        <Button size="small" variation="link" fillWidth="true">
          Details
        </Button>
      </div>
    </div>
  );
}
