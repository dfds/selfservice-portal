import React, { useContext } from "react";
import ErrorContext from "./ErrorContext";
import ErrorToast from "components/Toast/index.js";
import styles from "errordisplay.module.css";

const ErrorDisplay = () => {
  const defaultErrorMessage =
    "Oh no! We had an issue while loading the page, you can try reloading to see if it fixes it.";
  const { errors } = useContext(ErrorContext); //error is multiple errors
  if (errors.length === 0) {
    return null;
  }
  return (
    <div className={styles.toasts_container}>
      {errors.map((e, index) => (
        <>
          <ErrorToast
            key={index}
            message={defaultErrorMessage}
            errorTitle={e.title}
            errorDetails={e.details}
          ></ErrorToast>
        </>
      ))}
    </div>
  );
};

export default ErrorDisplay;
