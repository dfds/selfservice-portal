import { Text } from "@dfds-ui/react-components";
import { TrackedLink } from "@/components/Tracking";

export default function GrafanaWarning() {
  return (
    <div style={warningStyle}>
      <Text style={headerStyle}>
        Urgent: Grafana Metrics Cost Reduction Requirement
      </Text>
      <Text>Call for action: Update your environment tag!</Text>
      <Text>
        Read more{" "}
        <TrackedLink
          trackName="Wiki-Grafana-Tracking-Issue"
          href="https://wiki.dfds.cloud/en/announcements/grafana-cost-reduction"
        >
          here
        </TrackedLink>
        .
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
};

const headerStyle = {
  fontWeight: "bold",
  fontSize: "16px",
  marginBottom: "5px",
};
