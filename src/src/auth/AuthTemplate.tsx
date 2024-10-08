import React from "react";
import { msalInstance, selfServiceApiScopes } from "./context";
import { useDispatch, useSelector } from "react-redux";
import { refreshAuthState } from "@/state/local/auth";
import { StoreReducers } from "@/state/local/store";
import styles from "./AuthTemplate.module.css";

type FaaCFunction = <T>(args: T) => React.ReactNode;
function getChildrenOrFunction<T>(
  children: React.ReactNode | FaaCFunction,
  args: T,
): React.ReactNode {
  if (typeof children === "function") {
    return children(args);
  }
  return children;
}

function AuthTemplate({ children }) {
  const dispatch = useDispatch();
  const authState = useSelector((s) => (s as StoreReducers).auth);

  msalInstance.handleRedirectPromise().then((data) => {
    dispatch(
      refreshAuthState({ msalInstance: msalInstance, redirectResponse: data }),
    );
  });

  const signIn = () => {
    msalInstance.acquireTokenRedirect({ scopes: selfServiceApiScopes });
  };

  return (
    <>
      {authState.initialLoadFinished ? (
        <div>
          {authState.isSessionActive ? (
            <div>
              <React.Fragment>
                {getChildrenOrFunction(children, null)}
              </React.Fragment>
            </div>
          ) : (
            <div className={styles.container}>
              <div className={styles.content}>
                <div className={styles.logo}>
                  <svg
                    viewBox="0 0 145 50"
                    data-testid="Logo"
                    className="styles.logo"
                  >
                    <path
                      d="m140.2 23.58-5.1-1.69c-1.15-.36-1.45-.59-1.45-1.81v-.46c0-1.65.63-1.65 2.17-1.65 3.26 0 7 .1 7 .1.39 0 .53-.13.53-.53V14c0-.4-.14-.53-.53-.53 0 0-4.12-.1-7.71-.1-4.08 0-6.45 1.76-6.45 5.57v1.78c0 4.12 2.34 4.82 4.54 5.51l5.07 1.65c1.16.36 1.45.69 1.45 1.91v.53c0 1.65-.59 1.76-2.14 1.76-3.51 0-8.21-.1-8.21-.1-.4 0-.53.13-.53.53v3.59c0 .4.13.53.53.53 0 0 4.79.1 8.9.1s6.44-1.93 6.44-5.75v-1.86c.03-4.12-2.33-4.85-4.51-5.54zM119.67 13.49H109c-.39 0-.53.13-.53.53V36c0 .4.14.53.53.53h10.63c4.09 0 6.46-2.27 6.46-6.1V19.59c.04-3.83-2.33-6.1-6.42-6.1zm1.49 16.06c0 1.64-.63 2.3-2.18 2.3h-5.49V18.14H119c1.55 0 2.18.65 2.18 2.31zM105.3 13.49H91.18c-.4 0-.53.13-.53.53V36c0 .4.13.53.53.53h3.92c.39 0 .52-.13.52-.53v-8.23h8.46c.4 0 .53-.13.53-.52v-3.61c0-.39-.13-.52-.53-.52h-8.46v-5h9.68c.4 0 .53-.14.53-.53V14c0-.38-.13-.51-.53-.51zM81 13.49H70.32c-.39 0-.53.13-.53.53V36c0 .4.14.53.53.53H81c4.08 0 6.45-2.27 6.45-6.1V19.59c-.04-3.83-2.45-6.1-6.45-6.1zm1.48 16.06c0 1.64-.62 2.3-2.17 2.3h-5.54V18.14h5.49c1.55 0 2.17.65 2.17 2.31zM69.4 0H29.18a.9.9 0 0 0-.85.5L.07 49.46a.33.33 0 0 0 .06.47.32.32 0 0 0 .27.07h40.2a.89.89 0 0 0 .86-.49L69.72.54a.33.33 0 0 0-.07-.47.32.32 0 0 0-.25-.07zm-23 32a.28.28 0 0 1-.27.28.42.42 0 0 1-.15 0l-9.2-5.31 5.31 9.2a.28.28 0 0 1-.1.38.33.33 0 0 1-.14 0H27.94a.28.28 0 0 1-.28-.28.23.23 0 0 1 0-.14l5.3-9.2-9.17 5.27a.28.28 0 0 1-.38-.11.31.31 0 0 1 0-.13V18a.27.27 0 0 1 .28-.27.28.28 0 0 1 .13 0L33 23.11l-5.31-9.2a.28.28 0 0 1 .1-.38.33.33 0 0 1 .14 0h13.91a.29.29 0 0 1 .28.28.23.23 0 0 1 0 .14l-5.31 9.2L46 17.8a.27.27 0 0 1 .38.1.23.23 0 0 1 0 .14z"
                      fill="#002b45"
                    ></path>
                  </svg>
                </div>
                <div
                  className={styles.button}
                  onClick={() => {
                    signIn();
                  }}
                >
                  Sign in with DFDS account
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}

export default AuthTemplate;
