import React, { useContext } from "react";
import ErrorContext from "./ErrorContext";
import Toast from "components/Toast/index.js";

const ErrorDisplay = () => {
  const { error } = useContext(ErrorContext);

  if (error.length === 0) {
    return null;
  }

  return (
    <div>
      {error.map((e, index) => (
        <Toast key={index} message={e}></Toast>
      ))}
    </div>
  );
};

export default ErrorDisplay;
