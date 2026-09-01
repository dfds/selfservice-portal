import { Button } from "@/components/ui/button";
import { useTracking } from "@/hooks/Tracking";
import { useRybbit } from "@/RybbitContext";
import { cn } from "@/lib/utils";

function fireRybbitEvent(trackEvent, rybbitEvent) {
  if (!rybbitEvent) return;
  if (typeof rybbitEvent === "string") {
    trackEvent(rybbitEvent);
  } else if (
    rybbitEvent &&
    typeof rybbitEvent === "object" &&
    rybbitEvent.name
  ) {
    trackEvent(rybbitEvent.name, rybbitEvent.properties);
  }
}

function fireOutboundLinkEvent(trackEvent, trackName, href) {
  try {
    trackEvent("outbound:link:clicked", {
      target: trackName || undefined,
      href: href || undefined,
      source_page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  } catch (e) {
    // analytics must never break the UI
  }
}

// Maps DFDS button props to shadcn Button props
function mapVariant(variation) {
  const map = {
    primary: "default",
    secondary: "outline",
    outlined: "outline",
    danger: "destructive",
    link: "link",
    action: "action",
  };
  return map[variation] ?? "default";
}

function mapSize(size) {
  if (size === "small") return "sm";
  if (size === "large") return "lg";
  return "default";
}

export const TrackedButton = ({
  onClick,
  trackName,
  rybbitEvent,
  children,
  variation,
  size,
  fillWidth,
  submitting,
  className,
  trackingEvent,
  ...props
}) => {
  const { track } = useTracking();
  const { trackEvent } = useRybbit();

  const handleClick = (...args) => {
    track("Button Click", trackName);
    fireRybbitEvent(trackEvent, rybbitEvent);
    if (typeof onClick === "function") {
      onClick(...args);
    }
  };

  return (
    <Button
      variant={mapVariant(variation)}
      size={mapSize(size)}
      disabled={submitting || props.disabled}
      className={cn(
        fillWidth === "true" || fillWidth === true ? "w-full" : "",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export const TrackedLinkButton = ({
  onClick,
  trackName,
  rybbitEvent,
  children,
  variation,
  size,
  fillWidth,
  submitting,
  className,
  ...props
}) => {
  const { track } = useTracking();
  const { trackEvent } = useRybbit();

  const handleClick = (...args) => {
    track("Link Button Click", trackName);
    if (rybbitEvent) {
      fireRybbitEvent(trackEvent, rybbitEvent);
    } else {
      fireOutboundLinkEvent(trackEvent, trackName, props.href);
    }
    if (typeof onClick === "function") {
      onClick(...args);
    }
  };

  return (
    <Button
      variant={
        mapVariant(variation) === "default" ? "link" : mapVariant(variation)
      }
      size={mapSize(size)}
      disabled={submitting || props.disabled}
      className={cn(
        fillWidth === "true" || fillWidth === true ? "w-full" : "",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export const TrackedLink = ({
  href,
  onClick,
  trackName,
  rybbitEvent,
  children,
  ...props
}) => {
  const { track } = useTracking();
  const { trackEvent } = useRybbit();

  const handleClick = (event) => {
    track("Link Click", trackName);
    if (rybbitEvent) {
      fireRybbitEvent(trackEvent, rybbitEvent);
    } else {
      fireOutboundLinkEvent(trackEvent, trackName, href);
    }
    if (typeof onClick === "function") {
      onClick(event);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
