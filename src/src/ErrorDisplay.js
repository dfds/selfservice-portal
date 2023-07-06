import React, { useContext } from 'react';
import  ErrorContext from "./ErrorContext";
import Toast from 'components/Toast/index.js'

const ErrorDisplay = () => {
  const { error } = useContext(ErrorContext);
  
  if (error.length === 0 ) {
    return null;
  }

  return (
    <div>
      {/* {(error.map(e => <Toast intent="critical">
        <div style={{display:'flex'}}>
          <div style={{display:'flex', flex: 2 }}>{e}</div>
          <div style={{display:'flex', flex: 1, justifyContent: 'flex-end', flexDirection: 'column'}}>
            <Button variation="primary">Primary</Button>
            <Button variation="primary">Primary</Button>
          </div>
        </div>
        </Toast>))}    */}

        {(error.map(e => <Toast message={e}></Toast>))}   

    </div>
  );
};

export default ErrorDisplay;
