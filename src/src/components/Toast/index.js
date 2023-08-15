import styles from "./toast.module.css";
import { Close } from "@dfds-ui/icons/system";
import { useState } from "react";

export default function Toast({ message }) {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container_toast}>
      <div className={styles.textbox}>{message}</div>
      <div className={styles.actionbox}>
        <div className={styles.toast_close} onClick={() => setIsOpen(false)}>
          <Close />
        </div>
        {/* <Button size="small" variation="outlined">Details</Button> */}
      </div>
    </div>
  );
}
