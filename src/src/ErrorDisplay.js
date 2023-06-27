import React, { useContext } from 'react';
import  ErrorContext from "./ErrorContext";
import { Toast } from '@dfds-ui/react-components'
import styles from "./errordisplay.module.css"

const ErrorDisplay = () => {
  const { error } = useContext(ErrorContext);
  
  if (error.length === 0 ) {
    return null;
  }

  return (
    <div className={styles.errortoast}>
      {(error.map(e => <Toast intent="critical">{e}</Toast>))}       
    </div>
  );
};

export default ErrorDisplay;
