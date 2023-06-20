import ErrorDisplay from 'ErrorDisplay';
import React, { createContext, useState } from 'react';

const ErrorContext = createContext(null);

function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  let msg;

  const handleError = (error) => {
   
    if (error == 401){
        msg = "Unauthorized user";                
    }
    
    setError(msg);
  };

  const state = {error, handleError}

  return <ErrorContext.Provider value={state}>
      {children}
    </ErrorContext.Provider>
  
};

export { ErrorContext as default, ErrorProvider }