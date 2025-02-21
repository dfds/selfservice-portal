import { Button, LinkButton } from "@dfds-ui/react-components";
import { useTracking } from "@/hooks/Tracking";

export const TrackedButton = ({ onClick, trackName, children, ...props }) => {
  const { track } = useTracking();

  const handleClick = (...args) => {
    track("Button Click", trackName);

    if (typeof onClick === "function") {
      onClick(...args);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export const TrackedLinkButton = ({
  onClick,
  trackName,
  children,
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
    <LinkButton onClick={handleClick} {...props}>
      {children}
    </LinkButton>
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
