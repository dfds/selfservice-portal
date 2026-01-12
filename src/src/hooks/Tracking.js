import { useContext } from "react";
import TrackingContext from "TrackingContext";

export function useTracking(opts) {
  const { trackingIsEnabled } = useContext(TrackingContext);

  let track = (...opts) => {
    if (trackingIsEnabled) {
      _paq.push(["trackEvent", ...opts]);
    }
  };

  return {
    track,
  };
}
