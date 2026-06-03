import React, { useEffect, useRef, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";

const RYBBIT_SCRIPT_URL =
  "https://ssu-preview.hellman.oxygen.dfds.cloud/tr/api/script.js";
const RYBBIT_SITE_ID = "2f8dd0f249df";

// Rybbit injects a `window.rybbit` object once its <script> finishes loading.
// We can't call identify() until that has happened — so we keep a small
// load-callback queue alongside a module-level loaded flag.
let scriptLoaded = false;
const onScriptLoad: Array<() => void> = [];

type RybbitState = {
  rybbitIsEnabled: boolean;
};

const RybbitContext = React.createContext<RybbitState>({
  rybbitIsEnabled: false,
});

function isRybbitHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.includes("ssu-preview.hellman.oxygen.dfds.cloud")) return true;
  return false;
}

type RybbitTraits = {
  email?: string;
  name?: string;
  username?: string;
};

function extractEmail(account: any): string | null {
  if (!account) return null;
  const claims = account.idTokenClaims || {};
  const raw =
    claims.preferred_username ||
    claims.upn ||
    claims.email ||
    account.username ||
    null;
  return raw || null;
}

function extractTraits(account: any): RybbitTraits {
  if (!account) return {};
  const claims = account.idTokenClaims || {};
  const email =
    claims.email ||
    claims.preferred_username ||
    claims.upn ||
    account.username ||
    undefined;
  const name = claims.name || account.name || undefined;
  const username =
    claims.preferred_username ||
    claims.upn ||
    account.username ||
    email ||
    undefined;
  const traits: RybbitTraits = {};
  if (email) traits.email = email;
  if (name) traits.name = name;
  if (username) traits.username = username;
  return traits;
}

function RybbitProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line no-restricted-globals
  const hostname = location.hostname;
  const isEnabled = isRybbitHost(hostname);

  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts && accounts.length > 0 ? accounts[0] : null;
  const email = isAuthenticated ? extractEmail(account) : null;
  const traits = isAuthenticated ? extractTraits(account) : {};
  // Stable key used to detect when *any* identifying info changes — covers the
  // rare case where name/username arrive after the initial sign-in event.
  const identityKey = email
    ? `${email}|${traits.name ?? ""}|${traits.username ?? ""}`
    : null;

  const scriptInjected = useRef(false);
  const lastIdentified = useRef<string | null>(null);

  // Inject the Rybbit script tag exactly once per page load.
  useEffect(() => {
    if (!isEnabled) return;
    if (scriptInjected.current) return;
    scriptInjected.current = true;

    const existing = document.querySelector(
      `script[src="${RYBBIT_SCRIPT_URL}"]`,
    );
    if (existing) {
      scriptLoaded = true;
      return;
    }

    const tag =
      hostname === "ssu-preview.hellman.oxygen.dfds.cloud"
        ? "production"
        : "dev";

    const s = document.createElement("script");
    s.src = RYBBIT_SCRIPT_URL;
    s.async = true;
    s.setAttribute("data-site-id", RYBBIT_SITE_ID);
    s.setAttribute("data-tag", tag);
    s.addEventListener("load", () => {
      scriptLoaded = true;
      while (onScriptLoad.length) {
        const cb = onScriptLoad.shift();
        try {
          cb && cb();
        } catch (e) {
          // analytics must never break the UI
        }
      }
    });
    document.head.appendChild(s);
  }, [isEnabled]);

  // Identify the user once both the script has loaded and we know the email.
  // identify() is idempotent for the same userId, but we still guard against
  // re-calling unnecessarily on every render.
  useEffect(() => {
    if (!isEnabled) return;

    const apply = () => {
      const rb = (window as any).rybbit;
      if (!rb) return;
      if (email && lastIdentified.current !== identityKey) {
        try {
          rb.identify(email, traits);
          lastIdentified.current = identityKey;
        } catch (e) {
          // analytics must never break the UI
        }
      } else if (!email && lastIdentified.current) {
        try {
          if (typeof rb.clearUserId === "function") rb.clearUserId();
          lastIdentified.current = null;
        } catch (e) {
          // analytics must never break the UI
        }
      }
    };

    if (scriptLoaded) {
      apply();
    } else {
      onScriptLoad.push(apply);
    }
  }, [isEnabled, identityKey]);

  const [state] = useState<RybbitState>({ rybbitIsEnabled: isEnabled });

  return (
    <RybbitContext.Provider value={state}>{children}</RybbitContext.Provider>
  );
}

export { RybbitContext as default, RybbitProvider };
