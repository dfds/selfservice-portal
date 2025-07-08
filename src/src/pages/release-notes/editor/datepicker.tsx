import * as React from "react";
import { useState } from "react";

import styles from "./input.module.scss";

export interface DatePickerProps {
  placeholder?: any;
  onChange?: any;
  inputOverride?: string;
  label: string;
}

export function DatePicker({
  placeholder,
  onChange,
  inputOverride,
  label,
}: DatePickerProps) {
  const [inputValue, setInput] = useState(
    inputOverride != null ? inputOverride : "",
  );

  const handleInput = (evt) => {
    setInput(evt.target.value);
    onChange(evt);
  };

  const style = {
    width: "170px",
  };

  return (
    <>
      <div className={styles.input}>
        <div className={styles.left}>
          <span className={styles.key}>{label}:</span>
        </div>
        <div className={styles.right}>
          <input
            type="date"
            placeholder={placeholder != null ? placeholder : ""}
            onChange={handleInput}
            value={inputValue}
            style={style}
          ></input>
        </div>
      </div>
    </>
  );
}
