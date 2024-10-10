import React, { useContext } from "react";
import ErrorContext from "./ErrorContext";
import ErrorToast from "components/Toast/index.jsx";
import styles from "errordisplay.module.css";

const ErrorDisplay = () => {
  const defaultErrorMessage =
    "Oh no! Something went wrong while loading the page. You can try refreshing to resolve the issue.";
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
            title={e.title}
            details={e.details}
          ></ErrorToast>
        </>
      ))}
    </div>
  );
};

export default ErrorDisplay;
