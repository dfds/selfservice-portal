import { useContext } from "react";
import TrackingContext from "TrackingContext";

export function useTracking(opts) {
  const { trackingIsEnabled } = useContext(TrackingContext);

  let track = (...opts) => {
    console.log("tracking", opts);
    console.log("isEnabled", trackingIsEnabled);
    if (trackingIsEnabled) {
      // eslint-disable-next-line no-undef
      _paq.push(["trackEvent", ...opts]);
    }
  };

  return {
    track,
  };
}
