import React, { useContext, useEffect, useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { Button, ButtonStack, Spinner } from "@dfds-ui/react-components";
import Ajv from "ajv";
import SyntaxHighlighter from "react-syntax-highlighter";
import styles from "./jsonmetadata.module.css";
import PageSection from "../../../components/PageSection";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

export function JsonMetadataWithSchemaViewer() {
  const monaco = useMonaco();
  const { metadata, setCapabilityJsonMetadata } = useContext(
    SelectedCapabilityContext,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { selfServiceApiClient } = useContext(AppContext);
  const [currentMetadataString, setCurrentMetadataString] = useState(metadata);
  const [jsonString, setJsonString] = useState("");
  const [schemaString, setSchemaString] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (monaco && schemaString) {
      const monacoSchema = {
        fileMatch: ["*"],
        schema: JSON.parse(schemaString),
      };
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [monacoSchema],
      });
    }
  }, [schemaString, monaco]);

  useEffect(() => {
    if (metadata) {
      const prettyMetadata = prettifyJsonString(metadata);
      setCurrentMetadataString(prettyMetadata);
      setJsonString(prettyMetadata);
    }
  }, [metadata]);

  useEffect(async () => {
    if (schemaString === "") {
      const schema =
        await selfServiceApiClient.getCapabilityJsonMetadataSchema();
      setSchemaString(prettifyJsonString(schema));
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

  const checkIfJsonFollowsSchema = (json) => {
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(JSON.parse(schemaString));
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
                    if (!checkIfJsonFollowsSchema(e)) return;
                    setValidationError("");
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
                ></textarea>
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
                    disabled={isJsonValid(jsonString) === false}
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
                  {schemaString}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}
      </PageSection>
    </>
  );
}
