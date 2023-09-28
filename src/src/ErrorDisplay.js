import React, { useContext } from "react";
import ErrorContext from "./ErrorContext";
import Toast from "components/Toast/index.js";
import styles from "errordisplay.module.css"

const ErrorDisplay = () => {
  const { errors } = useContext(ErrorContext); //error is multiple errors
  if (errors.length === 0) {
    return null;
  }
  return (
    <div className={styles.toasts_container}>
      {errors.map((e, index) => (
        <>
        {console.log("going to display error: ", e)}
        <Toast key={index} message={e.msg} details={e.details ? e.details : null}></Toast>
        </>
      ))}
    </div>
  );
};

export default ErrorDisplay;
