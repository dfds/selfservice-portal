import ErrorDisplay from "ErrorDisplay";
import React, { createContext, useEffect, useState } from "react";

const ErrorContext = createContext();

function ErrorProvider({ children }) {
  const [error, setError] = useState([]);

  const showError = (errorMessage) => {
    setError((prevError) => [...prevError, errorMessage])
  };

  return (
    <ErrorContext.Provider value={{ error, showError }}>
      {<ErrorDisplay />}
      {children}
    </ErrorContext.Provider>
  );
}

export { ErrorContext as default, ErrorProvider };
