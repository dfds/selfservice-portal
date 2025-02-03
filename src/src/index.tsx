import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { GlobalStyles } from "@/dfds-ui/react-components/src";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./AppContext";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./auth/context";
import { ErrorProvider } from "./ErrorContext";
import { TrackingProvider } from "./TrackingContext";
import { PreAppProvider } from "./preAppContext";
import { Provider } from "react-redux";
import store from "./state/local/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./state/remote/client";

(window as any).apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
(window as any).env = process.env.NODE_ENV;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <GlobalStyles />
          <QueryClientProvider client={queryClient}>
            <ErrorProvider>
              <TrackingProvider>
                <PreAppProvider>
                  <AppProvider>
                    <App />
                  </AppProvider>
                </PreAppProvider>
              </TrackingProvider>
            </ErrorProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </MsalProvider>
    </Provider>
  </React.StrictMode>,
);
