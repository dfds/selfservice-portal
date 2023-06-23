import React, { useContext } from 'react';
import  ErrorContext from "./ErrorContext";
import { Toast } from '@dfds-ui/react-components'

const ErrorDisplay = () => {
  const { error } = useContext(ErrorContext);
  
  if (error.length === 0 ) {
    return null;
  }

  return (
    <div className="error">
      {(error.map(e => <Toast intent="critical">{e}</Toast>))}       
    </div>
  );
};

export default ErrorDisplay;
