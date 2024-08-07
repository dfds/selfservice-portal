import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { GlobalStyles } from "@dfds-ui/react-components";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./AppContext";
import { MsalProvider } from "@azure/msal-react";
import { MsalInstance } from "./AuthService";
import { ErrorProvider } from "ErrorContext";
import { TrackingProvider } from "TrackingContext";
import { PreAppProvider } from "preAppContext";

window.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
window.env = process.env.NODE_ENV;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <MsalProvider instance={MsalInstance}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <GlobalStyles />
        <ErrorProvider>
          <TrackingProvider>
            <PreAppProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </PreAppProvider>
          </TrackingProvider>
        </ErrorProvider>
      </BrowserRouter>
    </MsalProvider>
  </React.StrictMode>,
);
