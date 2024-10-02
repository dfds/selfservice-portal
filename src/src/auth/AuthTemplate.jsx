import { useIsAuthenticated } from "@azure/msal-react";
import { msalInstance } from "./context";
import { useDispatch, useSelector } from "react-redux";
import { refreshAuthState } from "state/local/auth";

function AuthTemplate() {
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();
  const msg = useSelector((s) => s.auth.throwaway);
  console.log(isAuthenticated);

  dispatch(refreshAuthState({ msalInstance: msalInstance }));

  return (
    <>
      <div>
        ree: {isAuthenticated} : {msg}
      </div>
    </>
  );
}

export default AuthTemplate;
