import React, { useEffect } from "react";

const TrackingContext = React.createContext(null);

function TrackingProvider({ children }) {
  let isEnabled = false;
  // eslint-disable-next-line no-restricted-globals
  let hostname = location.hostname;
  if (hostname.includes("build.dfds.cloud")) {
    isEnabled = true;
  }

  useEffect(() => {
    if (isEnabled) {
      var _mtm = (window._mtm = window._mtm || []);
      _mtm.push({ "mtm.startTime": new Date().getTime(), event: "mtm.Start" });
      var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src = "https://build.dfds.cloud/tr/js/container_nbYsx3GM.js";
      s.parentNode.insertBefore(g, s);
    }
  }, []);

  const state = {
    trackingIsEnabled: isEnabled,
  };

  return (
    <TrackingContext.Provider value={state}>
      {children}
    </TrackingContext.Provider>
  );
}

export { TrackingContext as default, TrackingProvider };
