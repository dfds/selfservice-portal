import { Button } from "@/components/ui/button";
import { useTracking } from "@/hooks/Tracking";
import { cn } from "@/lib/utils";

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

  const handleClick = (...args) => {
    track("Button Click", trackName);
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
  children,
  variation,
  size,
  fillWidth,
  submitting,
  className,
  ...props
}) => {
  const { track } = useTracking();

  const handleClick = (...args) => {
    track("Link Button Click", trackName);
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
  children,
  ...props
}) => {
  const { track } = useTracking();

  const handleClick = (event) => {
    track("Link Click", trackName);
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
