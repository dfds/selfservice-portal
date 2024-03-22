import React, { useContext, useEffect, useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import SyntaxHighlighter from "react-syntax-highlighter";
import styles from "./jsonmetadata.module.css";
import PageSection from "@/components/PageSection";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import JsonSchemaContext from "../../../JsonSchemaContext";
import { prettifyJsonString } from "../../../Utils";

export function JsonMetadataWithSchemaViewer() {
  const monaco = useMonaco();
  const { metadata, setCapabilityJsonMetadata } = useContext(
    SelectedCapabilityContext,
  );
  const { jsonSchema, jsonSchemaString } = useContext(JsonSchemaContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentMetadataString, setCurrentMetadataString] = useState(metadata);
  const [jsonString, setJsonString] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (monaco && jsonSchemaString) {
      const monacoSchema = {
        fileMatch: ["*"],
        schema: jsonSchema,
      };
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [monacoSchema],
      });
    }
  }, [jsonSchemaString, monaco]);

  useEffect(() => {
    if (metadata) {
      const prettyMetadata = prettifyJsonString(metadata);
      setCurrentMetadataString(prettyMetadata);
      setJsonString(prettyMetadata);
    }
  }, [metadata]);

  const checkIfJsonIsParsable = (json) => {
    try {
      JSON.parse(json);
      return true;
    } catch (exception) {
      setValidationError("Invalid JSON: " + exception.message);
      return false;
    }
  };

  const checkIfFollowsJsonSchema = (json) => {
    const Ajv2020 = require("ajv/dist/2020");
    const addFormats = require("ajv-formats").default;

    const ajv = new Ajv2020();
    addFormats(ajv);
    try {
      const validate = ajv.compile(jsonSchema);
      try {
        const valid = validate(JSON.parse(json));
        if (!valid) {
          setValidationError("Validation Error: " + validate.errors[0].message);
        }
        return valid;
      } catch (exception) {
        setValidationError("Validation Exception: " + exception.message);
        return false;
      }
    } catch (exception) {
      setValidationError("Schema Exception: " + exception.message);
      return false;
    }
  };

  const clearErrorMessage = () => {
    setValidationError("");
  };
  const hasJsonValidationError = () => {
    return validationError !== "";
  };

  const submitJsonMetadata = async () => {
    const prettyJsonString = prettifyJsonString(jsonString);
    if (isDirty) {
      setCapabilityJsonMetadata(prettyJsonString);
      setCurrentMetadataString(prettyJsonString);
      setJsonString(prettyJsonString);
    }
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };
  const cancelEditing = () => {
    setIsEditing(false);
    clearErrorMessage();
    setJsonString(currentMetadataString);
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
                {currentMetadataString}
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
              <div className={styles.jsonInputParent}>
                <MonacoEditor
                  name={"jsonmetadata"}
                  language="json"
                  value={jsonString}
                  errorMessage={validationError}
                  onChange={(e) => {
                    setIsDirty(true);
                    setJsonString(e);
                    if (!checkIfJsonIsParsable(e)) return;
                    if (!checkIfFollowsJsonSchema(e)) return;
                    clearErrorMessage();
                  }}
                  className={styles.jsonInputEditor}
                  options={{
                    minimap: { enabled: false },
                    overviewRulerLanes: 0,
                    scrollBeyondLastLine: false,
                    lineNumbers: "off",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "hidden",
                      handleMouseWheel: true,
                    },
                  }}
                ></MonacoEditor>
                <textarea
                  placeholder={"Validation errors appear here"}
                  className={styles.validationErrorText}
                  value={validationError}
                  onChange={() => {}}
                  readOnly
                />
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
                    disabled={hasJsonValidationError()}
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
                    border: "1px solid #ccc",
                    height: "370px",
                  }}
                >
                  {jsonSchemaString}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </>
  );
}
