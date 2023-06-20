import React, { useContext } from 'react';
import  ErrorContext from "./ErrorContext";

const ErrorDisplay = () => {
  const { error } = useContext(ErrorContext);

  if (!error) {
    return null; 
  }

  return (
    <div className="error">
      <p>Error: {error.message}</p>
    </div>
  );
};

export default ErrorDisplay;
