import { Text } from "@dfds-ui/react-components";
import { TrackedLink } from "@/components/Tracking";

export default function GrafanaWarning() {
  return (
    <div style={warningStyle}>
      <Text>Attention</Text>
      <Text>
        Grafana is currently experiencing issues. Please be aware that some
        dashboards may not be available or up-to-date.
      </Text>
      <Text>
        Check this{" "}
        <TrackedLink
          trackName="Wiki-Grafana-Tracking-Issue"
          href="https://wiki.dfds.cloud/playbooks"
        >
          Wiki page
        </TrackedLink>{" "}
        for more information.
      </Text>
    </div>
  );
}

// add styling rules for red background and white text
const warningStyle = {
  backgroundColor: "#ce3032ff",
  color: "white",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  borderColor: "darkred",
  borderWidth: "2px",
  borderStyle: "solid",
  textAlign: "center",
  fontWeight: "bold",
};
