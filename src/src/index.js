import React from "react";
import { Profiler } from "react";
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
import { createActorContext } from "@xstate/react";
import countMachine from "./xstate/CounterMachine";

window.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
window.env = process.env.NODE_ENV;

const container = document.getElementById("root");
const root = createRoot(container);
export const CounterMachineContext = createActorContext(countMachine);

export function onRender(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
) {
  console.log(
    `id=${id} phase=${phase} actualDuration=${actualDuration}  starttime=${startTime} `,
  );
}

root.render(
  <React.StrictMode>
    <CounterMachineContext.Provider>
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
    </CounterMachineContext.Provider>
  </React.StrictMode>,
);
