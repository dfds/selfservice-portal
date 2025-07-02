import * as React from "react";
import { useState, useRef } from "react";

import styles from "./input.module.scss";

export interface InputProps {
  placeholder?: any;
  onChange?: any;
}

export function Input({ placeholder, onChange }: InputProps) {
  const [inputValue, setInput] = useState("");
  const [inputSize, setInputSize] = useState("0px");

  const handleInput = (evt) => {
    setInput(evt.target.value);
    onChange(evt);
  };

  const sizerStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    visibility: "hidden",
    height: 0,
  };

  const sizerRef = useRef<any>();

  React.useEffect(() => {
    const width = sizerRef.current.getBoundingClientRect().width;
    if (width == 0) {
      setInputSize("450px");
      return;
    }
    const newWidth = Math.round(width <= 30 ? 70 : width + 40);
    setInputSize(`${newWidth}px`);
  }, [inputValue]);

  const style = {
    width: inputSize,
  };

  return (
    <>
      {/* <div className="input"> */}
      <div className={styles.input}>
        <span className="key">Title:</span>
        <div style={sizerStyle} ref={sizerRef}>
          {inputValue}
        </div>
        <input
          placeholder={placeholder != null ? placeholder : ""}
          onChange={handleInput}
          value={inputValue}
          style={style}
        ></input>
      </div>
    </>
  );
}
