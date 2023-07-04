import React from "react";
import { useState } from "react";
import { Text } from "@dfds-ui/typography";
import { Card, CardContent, Button, ButtonStack } from "@dfds-ui/react-components";
import { Modal } from "@dfds-ui/modal";
import { ResourceInfoBadges } from "./resourceInfoBadges";

export default function Resources() {
  const [showLogModal, setLogModal] = useState(false);
  const handleApplicationLogShow = async () => {
    setLogModal(true);
  };

  return (
    <>
      <Text styledAs="sectionHeadline">Resources</Text>
      <Card variant="fill" surface="main">
        <CardContent>
          <p>
            A capability is the 'container' for your cloud resources. Currently
            we support 1 AWS Account (sandbox) and 1 Kubernetes namespace per
            capability. These are not added per default to a capability, but
            must be requested by clicking the button below. Note that there is
            manual processing involved in getting an AWS account attached so it
            may take a while before your resources are ready.
          </p>

          <ResourceInfoBadges />

          <ButtonStack align="left" style={{marginTop: '15px'}}>
            <Button size="small" variation="outlined" onClick={handleApplicationLogShow}>
              How to see application logs?
            </Button>
          </ButtonStack>
        </CardContent>
      </Card>

      <Modal
        heading={"How do I see my application logs?"}
        isOpen={showLogModal}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setLogModal(false);
        }}
        sizes={{
          s: "50%",
          m: "50%",
          l: "50%",
          xl: "50%",
          xxl: "50%",
        }}
      >
        <Text>
          <Text styledAs={"smallHeadline"}>
            For applications running in Kubernetes
          </Text>
        </Text>
        <Text>
          1. Sign into the <i>dfds-logs</i> using the <i>CapabilityLog</i> role at <a target="_blank" href="https://dfds.awsapps.com/start/">https://dfds.awsapps.com/start/</a>
          <br />
          2. Once signed in, make sure your region is set to <i>eu-west-1</i>.
          <br />
          3. Navigate to the CloudWatch service either using the navigation menu or <a target="_blank" href="https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#home:">this link</a>
          <br />
          4. Once there, select "Logs" in the menu on your left, and then "Logs Insights"
          <br />
          5. From this view, you can query logs in Kubernetes. For example queries, please check our wiki article at <a target="_blank" href="https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch">https://wiki.dfds.cloud/en/playbooks/observability/logging_cloudwatch</a>

        </Text>
      </Modal>
    </>
  );
}
