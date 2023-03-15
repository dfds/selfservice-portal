import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { GlobalStyles } from '@dfds-ui/react-components';
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./app-context";

import { MsalProvider } from "@azure/msal-react";
import { MsalInstance } from "./AuthService";

window.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

render(
   <React.StrictMode>
    <MsalProvider instance={MsalInstance}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <GlobalStyles />
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </MsalProvider>
   </React.StrictMode>, 
  document.getElementById('root')
);