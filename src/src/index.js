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
import store from "./redux/store";
import { Provider } from "react-redux";

window.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
window.env = process.env.NODE_ENV;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <MsalProvider instance={MsalInstance}>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <GlobalStyles />
          <ErrorProvider>
            <TrackingProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </TrackingProvider>
          </ErrorProvider>
        </BrowserRouter>
      </MsalProvider>
    </Provider>
  </React.StrictMode>,
);
