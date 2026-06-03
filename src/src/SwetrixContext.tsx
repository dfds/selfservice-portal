import React, { useEffect, useRef, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import * as swetrix from "swetrix";

const SWETRIX_PROJECT_ID = "nYQqfcuBdvyn";
const SWETRIX_API_URL =
  "https://swetrix.hellman.oxygen.dfds.cloud/backend/v1/log";

// Module-level mutable profileId. swetrix.init() is idempotent in this library
// (see node_modules/swetrix/dist/esnext/index.js: `if (!LIB_INSTANCE) { ... }`),
// so we cannot push a fresh profileId in via re-init after login. Instead we
// keep a live ref and inject it on each pageview (via the trackViews callback)
// and on each custom track() call (read by hooks/Tracking.js).
let currentSwetrixProfileId: string | null = null;

export function getSwetrixProfileId(): string | null {
  return currentSwetrixProfileId;
}

type SwetrixState = {
  swetrixIsEnabled: boolean;
};

const SwetrixContext = React.createContext<SwetrixState>({
  swetrixIsEnabled: false,
});

function isSwetrixHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.includes("ssu-preview.hellman.oxygen.dfds.cloud")) return true;
  return false;
}

function extractEmail(account: any): string | null {
  if (!account) return null;
  const claims = account.idTokenClaims || {};
  const raw =
    claims.preferred_username ||
    claims.upn ||
    claims.email ||
    account.username ||
    null;
  if (!raw) return null;
  // Swetrix auto-hashes anything that looks like an email. We want a stable,
  // human-readable profileId in the dashboard, so use only the local part.
  const at = raw.indexOf("@");
  return at > 0 ? raw.slice(0, at) : raw;
}

function SwetrixProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line no-restricted-globals
  const hostname = location.hostname;
  // Swetrix tracking is disabled — Rybbit is the active analytics stream.
  // Flip this back to `isSwetrixHost(hostname)` to re-enable.
  const isEnabled = false;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts && accounts.length > 0 ? accounts[0] : null;
  const email = isAuthenticated ? extractEmail(account) : null;

  const initialised = useRef(false);

  // Keep the module-level ref in sync with the current React-tracked email so
  // the trackViews callback and useTracking can both read the freshest value.
  if (currentSwetrixProfileId !== email) {
    currentSwetrixProfileId = email;
  }

  useEffect(() => {
    if (!isEnabled) return;
    if (initialised.current) return;

    swetrix.init(SWETRIX_PROJECT_ID, {
      apiURL: SWETRIX_API_URL,
      devMode: isLocal,
      profileId: email ?? undefined,
    });

    swetrix.trackViews({
      callback: (payload: any) => {
        const pid = currentSwetrixProfileId;
        if (pid) return { ...payload, profileId: pid };
        return payload;
      },
    });

    swetrix.trackErrors();
    initialised.current = true;
  }, [isEnabled, isLocal, email]);

  const [state] = useState<SwetrixState>({ swetrixIsEnabled: isEnabled });

  return (
    <SwetrixContext.Provider value={state}>{children}</SwetrixContext.Provider>
  );
}

export { SwetrixContext as default, SwetrixProvider };
