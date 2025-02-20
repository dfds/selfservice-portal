import { Button } from "@dfds-ui/react-components";
import { useTracking } from "@/hooks/Tracking";

export const TrackedButton = ({ onClick, trackName, children, ...props }) => {
  const { track } = useTracking();

  const handleClick = (...args) => {
    console.log("Button Clicked");
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

export const TrackedLink = ({
  href,
  onClick,
  trackName,
  children,
  ...props
}) => {
  const { track } = useTracking();

  const handleClick = (event) => {
    console.log("Link Clicked");
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
