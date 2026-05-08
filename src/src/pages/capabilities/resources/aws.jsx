import React from "react";
import PageSection from "@/components/PageSection";
import { AwsResourceInfoBadges } from "./resourceInfoBadges";
import { TrackedLink } from "@/components/Tracking";

export default function AwsResources({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="AWS &amp; Kubernetes">
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Request an AWS account and Kubernetes namespace for this capability.
        Manual processing is involved in getting an AWS account attached.{" "}
        <TrackedLink
          trackName="Wiki-CloudResourcesGuide"
          target="_blank"
          rel="noopener noreferrer"
          href="https://dfds.sharepoint.com/sites/GroupIT_Architecture/Lists/TEST%20%20Architecture%20Decision%20Record/DispForm.aspx?ID=5&e=M0gIY9"
        >
          DFDS Cloud Usage Guidelines
        </TrackedLink>
      </p>
      <AwsResourceInfoBadges />
    </PageSection>
  );
}
