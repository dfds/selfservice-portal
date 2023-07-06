import ErrorDisplay from 'ErrorDisplay';
import React, { createContext, useEffect, useState } from 'react';

const ErrorContext = createContext();

function ErrorProvider({ children }) {
  const [error, setError] = useState([]);
  let errorMsg;

  const handleError = (err) => {
    
    // if (err== 401){
    //     errorMsg = "Unauthorized user";                
    // }

    // console.log(errorMsg);
   
    // setError((prevError) => [...prevError, errorMsg]);
  };

  const showError = errorMessage => setError((prevError) => [...prevError, errorMessage]);

  // useEffect(() => {
  //   if (error.length > 0) {
  //     const timeoutId = setTimeout(() => {
  //       setError([]);
  //     }, 5000);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [error]);

  return (
    <ErrorContext.Provider value={{ error, handleError, showError }}>
      {<ErrorDisplay/>} 
      {children}      
    </ErrorContext.Provider>
  );
};

export { ErrorContext as default, ErrorProvider }