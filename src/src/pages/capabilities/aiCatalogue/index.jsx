import React, { useEffect, useContext, useState } from "react";
import PageSection from "components/PageSection";
import { Text } from "@dfds-ui/react-components";

export function AICatalogueSection({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="AI Catalogue">
      <AICatalogue />
    </PageSection>
  );
}

export function AICatalogue() {
  return (
    <>
      <Text>
        You are seeing this section because this capability has been marked as
        providing AI services.
      </Text>
    </>
  );
}
