import React, { useEffect, useContext, useState } from "react";
import { shallowEqual } from "Utils";
import { ButtonStack } from "@dfds-ui/react-components";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { CapabilityTagsSubForm } from "./capabilityTagsSubForm";
import JsonSchemaContext from "../../../JsonSchemaContext";
import { useUpdateRequiredCapabilityMetadata } from "@/state/remote/queries/capabilities";
import PreAppContext from "@/preAppContext";
import { TrackedButton } from "@/components/Tracking";

export function CapabilityTagViewer() {
  // does set update the backend? How is this done in the metadata view?
  const { metadata, links, details, inProgressMetadata } = useContext(
    SelectedCapabilityContext,
  );
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const updateRequiredCapabilityMetadata =
    useUpdateRequiredCapabilityMetadata();
  const { hasJsonSchemaProperties } = useContext(JsonSchemaContext);
  const [canEditJsonMetadata, setCanEditJsonMetadata] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState({});
  const [existingFormData, setExistingFormData] = useState({});

  useEffect(() => {
    if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
      setCanEditJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      setExistingFormData(JSON.parse(metadata));
    }

    if (shallowEqual(formData, existingFormData)) {
      setIsDirty(false);
    } else {
      setIsDirty(true);
    }
  }, [formData, metadata]);

  const submitTags = (formdata) => {
    // do not override non-required metadata fields, should they exist
    var mergedMetaData = { ...existingFormData };
    Object.keys(formdata).forEach((key) => {
      mergedMetaData[key] = formdata[key];
    });

    updateRequiredCapabilityMetadata.mutate({
      capabilityDefinition: details,
      payload: {
        jsonMetadata: mergedMetaData,
      },
      isCloudEngineerEnabled: isCloudEngineerEnabled,
    });
    setIsDirty(false);
  };

  return (
    hasJsonSchemaProperties && (
      <>
        <PageSection headline="Capability Tags">
          <CapabilityTagsSubForm
            setMetadata={setFormData}
            setValidMetadata={setIsValid}
            preexistingFormData={existingFormData}
          />
          <ButtonStack align={"right"}>
            <TrackedButton
              trackName="CapabilityTags-Submit"
              size="small"
              variation="outlined"
              submitting={inProgressMetadata}
              onClick={() => submitTags(formData)}
              disabled={!isValid || !isDirty || !canEditJsonMetadata}
            >
              Submit
            </TrackedButton>
          </ButtonStack>
        </PageSection>
      </>
    )
  );
}
