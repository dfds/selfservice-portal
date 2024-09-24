import React, { useEffect, useContext, useState } from "react";
import { shallowEqual } from "Utils";
import SelectedCapabilityContext from "../../SelectedCapabilityContext";
import { CapabilityTagsSubForm } from "./capabilityTagsSubForm";

export function CapabilityTagViewer({
  metadataObject,
  setCurrentMetadataObject,
  setIsValidMetadata,
  canEditJsonMetadata,
}) {
  return (
    <CapabilityTagsSubForm
      setMetadata={setCurrentMetadataObject}
      setValidMetadata={setIsValidMetadata}
      preexistingFormData={metadataObject}
      canEditJsonMetadata={canEditJsonMetadata}
    />
  );
}
