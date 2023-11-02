import React, { useContext, useEffect, useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { Button, ButtonStack, Spinner } from "@dfds-ui/react-components";
import { TextareaField } from "@dfds-ui/forms";
import Ajv from "ajv";
import SyntaxHighlighter from "react-syntax-highlighter";
import styles from "./jsonmetadata.module.css";
import PageSection from "../../../components/PageSection";
import { nnfx as syntaxStyle } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export function JsonMetadataWithSchemaViewer() {
  const { metadata, setCapabilityJsonMetadata } = useContext(
    SelectedCapabilityContext,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { selfServiceApiClient } = useContext(AppContext);
  const [currentMetadata, setCurrentMetadata] = useState(metadata);
  const [json, setJson] = useState("");
  const [schema, setSchema] = useState(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (metadata) {
      const prettyMetadata = prettifyJsonString(json);
      setCurrentMetadata(prettyMetadata);
      setJson(prettyMetadata);
    }
  }, [metadata]);

  useEffect(() => {
    if (schema === null) {
      selfServiceApiClient.getCapabilityJsonMetadataSchema().then((schema) => {
        setSchema(schema);
      });
    }
  }, []);

  const checkIfJsonIsParsable = (json) => {
    try {
      JSON.parse(json);
      return true;
    } catch (exception) {
      setValidationError("Invalid JSON: " + exception.message);
      return false;
    }
  };

  const checkIfFollowsSchema = (json) => {
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(JSON.parse(schema));
      const valid = validate(JSON.parse(json));
      if (!valid) {
        setValidationError("Schema Error: " + validate.errors[0].message);
      }
      return valid;
    } catch (exception) {
      setValidationError("Schema Error: " + exception.message);
      return false;
    }
  };

  const isJsonValid = (json) => {
    return validationError === "";
  };

  const prettifyJsonString = (json) => {
    return JSON.stringify(JSON.parse(json), null, 2);
  };

  const submitJsonMetadata = () => {
    const prettyJson = prettifyJsonString(json);
    if (isDirty) {
      setCapabilityJsonMetadata(prettyJson);
      setCurrentMetadata(prettyJson);
      setJson(prettyJson);
    }
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };
  const cancelEditing = () => {
    setIsEditing(false);
    setJson(currentMetadata);
  };

  return (
    <>
      <PageSection headline="Metadata">
        {!isEditing && (
          <div>
            <div className={styles.metadataView}>
              <SyntaxHighlighter
                language="json"
                style={syntaxStyle}
                wrapLongLines={false}
                customStyle={{
                  margin: "0",
                }}
              >
                {currentMetadata}
              </SyntaxHighlighter>
            </div>
            <ButtonStack>
              <Button size="small" variation="primary" onClick={startEditing}>
                Edit
              </Button>
            </ButtonStack>
          </div>
        )}
        {isEditing && (
          <div>
            <div className={styles.jsonParent}>
              <div className={styles.jsonInput}>
                JSON:
                <TextareaField
                  name={"jsonmetadata"}
                  style={{ height: "300px" }}
                  value={json}
                  errorMessage={validationError}
                  onChange={(e) => {
                    setIsDirty(true);
                    setJson(e.target.value);
                    if (!checkIfJsonIsParsable(e.target.value)) {
                      return;
                    }
                    checkIfFollowsSchema(e.target.value);
                    setValidationError("");
                  }}
                ></TextareaField>
                <ButtonStack align={"right"}>
                  <Button
                    size="small"
                    variation="danger"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variation="outlined"
                    onClick={submitJsonMetadata}
                    disabled={isJsonValid(json) === false}
                  >
                    Submit
                  </Button>
                </ButtonStack>
              </div>
              <div className={styles.jsonSchema}>
                Schema:
                <SyntaxHighlighter
                  language="json"
                  style={syntaxStyle}
                  wrapLongLines={false}
                  customStyle={{
                    margin: "0",
                    padding: "0",
                    height: "300px",
                    border: "1px solid #ccc",
                  }}
                >
                  {schema}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </>
  );
}
