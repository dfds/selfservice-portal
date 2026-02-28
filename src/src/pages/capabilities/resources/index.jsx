import React from "react";
import PageSection from "components/PageSection";
import { ResourceInfoBadges } from "./resourceInfoBadges";
import { TrackedLink } from "@/components/Tracking";

export default function Resources({ anchorId, capabilityId }) {
  return (
    <PageSection id={anchorId} headline="Resources">
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        A capability is the container for your cloud resources. Currently we
        support 1 AWS Account (sandbox), 1 Kubernetes namespace, and several
        Azure Resource Groups per capability. These are not added by default and
        must be requested below. Manual processing is involved in getting an AWS
        account attached.{" "}
        <TrackedLink
          trackName="Wiki-CloudResourcesGuide"
          target="_blank"
          rel="noopener noreferrer"
          href="https://dfds.sharepoint.com/sites/GroupIT_Architecture/Lists/TEST%20%20Architecture%20Decision%20Record/DispForm.aspx?ID=5&e=M0gIY9"
        >
          DFDS Cloud Usage Guidelines
        </TrackedLink>
      </p>
      <ResourceInfoBadges />
    </PageSection>
  );
}
