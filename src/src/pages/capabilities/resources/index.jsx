import React from "react";
import PageSection from "components/PageSection";
import { Card, CardContent } from "@dfds-ui/react-components";
import { ResourceInfoBadges } from "./resourceInfoBadges";
import { TrackedLink } from "@/components/Tracking";

export default function Resources({ capabilityId }) {
  return (
    <>
      <PageSection headline="Resources">
        <Card variant="fill" surface="main">
          <CardContent>
            <p>
              A capability is the 'container' for your cloud resources.
              Currently we support 1 AWS Account (sandbox), 1 Kubernetes
              namespace, and several Azure Resource Groups per capability.
              <br />
              These are not added per default to a capability, but must be
              requested by clicking the buttons below. Note that there is manual
              processing involved in getting an AWS account attached so it may
              take a while before your resources are ready.
              <br />
              Please refer to the{" "}
              <TrackedLink
                trackName="Wiki-CloudResourcesGuide"
                target="_blank"
                rel="noopener noreferrer"
                href="https://wiki.dfds.cloud/en/architecture/Architectural-Decision-Records-ADRS/which-cloud"
              >
                the DFDS Cloud Usage Guidelines
              </TrackedLink>{" "}
              for more information about when to use which provider.
            </p>

            <ResourceInfoBadges />
          </CardContent>
        </Card>
      </PageSection>
    </>
  );
}
