import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { GlobalStyles } from '@dfds-ui/react-components';
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./app-context";

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter basename='/v2'>
        <GlobalStyles />
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);