import ErrorDisplay from "ErrorDisplay";
import React, { createContext, useEffect, useState } from "react";

class ErrorContent {
  msg = null;
  details = null;
  constructor(msg, details) {
    this.msg = msg;
    this.details = details;
  }
}

const ErrorContext = createContext();

function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  const showError = (errorMessage, errorDetails = null) => {
    // console.log("adding new error with msg: ", errorMessage); //leaving this here for debugging inb4 comment on PR
    const error = new ErrorContent(errorMessage, errorDetails);
    setErrors((prevError) => [...prevError, error]);
  };

  return (
    <ErrorContext.Provider value={{ errors, showError }}>
      {children}
      {<ErrorDisplay />}
    </ErrorContext.Provider>
  );
}

export { ErrorContext as default, ErrorProvider };
