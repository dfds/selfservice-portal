import { useContext } from "react";
import TrackingContext from "@/TrackingContext";
import SwetrixContext, { getSwetrixProfileId } from "@/SwetrixContext";
import RybbitContext from "@/RybbitContext";
import * as swetrix from "swetrix";

export function useTracking(opts) {
  const { trackingIsEnabled } = useContext(TrackingContext);
  const { swetrixIsEnabled } = useContext(SwetrixContext);
  const { rybbitIsEnabled } = useContext(RybbitContext);

  let track = (...opts) => {
    if (trackingIsEnabled) {
      // eslint-disable-next-line no-undef
      _paq.push(["trackEvent", ...opts]);
    }
    if (swetrixIsEnabled) {
      const [category, label, ...rest] = opts;
      const ev = String(category || "event").replace(/\s+/g, "_");
      const meta = { label: label != null ? String(label) : "" };
      if (rest.length) meta.extra = JSON.stringify(rest);
      const profileId = getSwetrixProfileId();
      try {
        swetrix.track(profileId ? { ev, meta, profileId } : { ev, meta });
      } catch (e) {
        // analytics must never break the UI
      }
    }
    if (rybbitIsEnabled) {
      const [category, label, ...rest] = opts;
      const ev = String(category || "event").replace(/\s+/g, "_");
      const properties = { label: label != null ? String(label) : "" };
      if (rest.length) properties.extra = JSON.stringify(rest);
      try {
        const rb = window.rybbit;
        if (rb && typeof rb.event === "function") {
          rb.event(ev, properties);
        }
      } catch (e) {
        // analytics must never break the UI
      }
    }
  };

  return {
    track,
  };
}
