import React, { useContext, useState, useEffect } from "react";
import { TabbedPageSection } from "../../../components/PageSection";
import JsonSchemaContext from "../../../JsonSchemaContext";
import { Text } from "@dfds-ui/react-components";
import { CapabilityTagsSubForm } from "./capabilityTags/capabilityTagsSubForm";
import { JsonMetadataWithSchemaViewer } from "./jsonmetadata";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { shallowEqual } from "Utils";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import PreAppContext from "@/preAppContext";
import { TrackedButton, TrackedLink } from "@/components/Tracking";

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
    <>
      <Text>
        Tagging your capability correctly helps all of us with oversight and
        incident management.
      </Text>
      <Text>
        However, tagging capabilities is only the first step; Please remember to
        tag your cloud resources as well.
        <TrackedLink
          trackName="TaggingPolicy"
          href={"https://wiki.dfds.cloud/en/playbooks/standards/tagging_policy"}
          target="_blank"
          rel="noreferrer"
        >
          <Text>see DFDS Tagging Policy.</Text>
        </TrackedLink>
      </Text>
    </>
  );

  const footer = (
    <TrackedButton
      trackName="JsonMetaData-Submit"
      size="small"
      variation="outlined"
      onClick={submitJsonMetadata}
      disabled={!canEditJsonMetadata || !isDirty || !isValid}
    >
      Submit
    </TrackedButton>
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
