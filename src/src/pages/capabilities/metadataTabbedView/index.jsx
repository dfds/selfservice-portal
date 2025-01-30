import React, { useContext, useState, useEffect } from "react";
import { TabbedPageSection } from "../../../components/PageSection";
import JsonSchemaContext from "../../../JsonSchemaContext";
import { Button, Text } from "@/components/dfds-ui/react-components";
import { CapabilityTagsSubForm } from "./capabilityTags/capabilityTagsSubForm";
import { JsonMetadataWithSchemaViewer } from "./jsonmetadata";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { shallowEqual } from "Utils";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import PreAppContext from "@/preAppContext";

export function MetadataTabbedView() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { metadata, links, details } = useContext(SelectedCapabilityContext);
  const updateCapabilityMetadata = useUpdateCapabilityMetadata();

  const { jsonSchema, hasJsonSchemaProperties } = useContext(JsonSchemaContext);
  const [canEditJsonMetadata, setCanEditJsonMetadata] = useState(false);
  const [metadataObject, setMetadataObject] = useState({});
  const [currentMetadataObject, setCurrentMetadataObject] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
      setCanEditJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata) {
      setMetadataObject(JSON.parse(metadata));
      setCurrentMetadataObject(JSON.parse(metadata));
    }
  }, [metadata]);

  const submitJsonMetadata = () => {
    updateCapabilityMetadata.mutate({
      capabilityDefinition: details,
      payload: {
        jsonMetadata: currentMetadataObject,
      },
      isCloudEngineerEnabled: isCloudEngineerEnabled,
    });
    setIsDirty(false);
  };

  useEffect(() => {
    if (!shallowEqual(metadataObject, currentMetadataObject)) {
      setIsDirty(true);
    }
  }, [currentMetadataObject, metadataObject]);

  const header = (
    <a
      href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
      target="_blank"
      rel="noreferrer"
    >
      <Text>See Tagging Policy</Text>
    </a>
  );

  const footer = (
    <Button
      size="small"
      variation="outlined"
      onClick={submitJsonMetadata}
      disabled={!canEditJsonMetadata || !isDirty || !isValid}
    >
      Submit
    </Button>
  );

  const tabs = {
    form: "Form View",
    json: "JSON View",
  };

  const tabsContent = {
    form: (
      <CapabilityTagsSubForm
        setMetadata={setCurrentMetadataObject}
        setValidMetadata={setIsValid}
        preexistingFormData={currentMetadataObject}
        canEditJsonMetadata={canEditJsonMetadata}
        jsonSchema={jsonSchema}
      />
    ),
    json: (
      <JsonMetadataWithSchemaViewer
        metadataObject={currentMetadataObject}
        setCurrentMetadataObject={setCurrentMetadataObject}
        setIsValidMetadata={setIsValid}
        canEditJsonMetadata={canEditJsonMetadata}
      />
    ),
  };

  return (
    hasJsonSchemaProperties && (
      <TabbedPageSection
        headline="Capability Tags & Metadata"
        tabs={tabs}
        tabsContent={tabsContent}
        header={header}
        footer={footer}
      />
    )
  );
}
