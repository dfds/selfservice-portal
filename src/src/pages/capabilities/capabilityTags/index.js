import React, { useEffect, useContext, useState } from "react";
import { shallowEqual } from "Utils";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { CapabilityTagsSubForm } from "./capabilityTagsSubForm";
import JsonSchemaContext from "../../../JsonSchemaContext";

export function CapabilityTagViewer() {
  // does set update the backend? How is this done in the metadata view?
  const {
    metadata,
    setRequiredCapabilityJsonMetadata,
    links,
    inProgressMetadata,
  } = useContext(SelectedCapabilityContext);
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

    setRequiredCapabilityJsonMetadata(JSON.stringify(mergedMetaData));
    setIsDirty(false);
  };

  return (
    hasJsonSchemaProperties &&
    canEditJsonMetadata && (
      <>
        <PageSection headline="Capability Tags">
          <CapabilityTagsSubForm
            setMetadata={setFormData}
            setValidMetadata={setIsValid}
            preexistingFormData={existingFormData}
          />

          <ButtonStack align={"right"}>
            <Button
              size="small"
              variation="outlined"
              submitting={inProgressMetadata}
              onClick={() => submitTags(formData)}
              disabled={!(isValid && isDirty)}
            >
              Submit
            </Button>
          </ButtonStack>
        </PageSection>
      </>
    )
  );
}
