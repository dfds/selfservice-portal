import ErrorDisplay from "ErrorDisplay";
import React, { createContext, useState } from "react";

class ErrorContent {
  title = null;
  details = null;
  constructor(title, details) {
    this.title = title;
    this.details = details;
  }
}

const ErrorContext = createContext();

function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  const showError = (errorTitle, errorDetails) => {
    console.log(`adding new error: ${errorTitle} ${errorDetails}`); // left here for debugging purposes
    const error = new ErrorContent(errorTitle, errorDetails);
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
