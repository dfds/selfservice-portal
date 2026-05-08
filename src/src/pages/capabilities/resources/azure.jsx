import React from "react";
import PageSection from "@/components/PageSection";
import { AzureResourceInfoBadges } from "./resourceInfoBadges";

export default function AzureResources({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="Azure">
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Request and manage Azure Resource Groups for this capability. Each
        resource group is scoped to a specific environment.
      </p>
      <AzureResourceInfoBadges />
    </PageSection>
  );
}
