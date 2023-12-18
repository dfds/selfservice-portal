import React, { useEffect, useContext, useState } from "react";
import { shallowEqual } from "Utils";
import { Button, ButtonStack, Text } from "@dfds-ui/react-components";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { CapabilityTagsSubForm } from "./capabilityTagsSubForm";
import JsonSchemaContext from "../../../JsonSchemaContext";

export function CapabilityTagViewer() {
  // does set update the backend? How is this done in the metadata view?
  const { metadata, setCapabilityJsonMetadata } = useContext(
    SelectedCapabilityContext,
  );
  const { hasFilteredJsonSchema } = useContext(JsonSchemaContext);

  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState({});
  const [existingFormData, setExistingFormData] = useState({});

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

    setCapabilityJsonMetadata(JSON.stringify(mergedMetaData));
    setIsDirty(false);
  };

  return (
    hasFilteredJsonSchema && (
      <>
        <PageSection headline="Capability Tags">
          <CapabilityTagsSubForm
            title=""
            setMetadata={setFormData}
            setValidMetadata={setIsValid}
            preexistingFormData={existingFormData}
          />

          <br />

          <ButtonStack align={"right"}>
            <Button
              size="small"
              variation="outlined"
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
