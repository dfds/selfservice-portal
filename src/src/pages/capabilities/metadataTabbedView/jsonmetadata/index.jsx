import React, { useContext, useEffect, useState } from "react";
import styles from "./jsonmetadata.module.css";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import JsonSchemaContext from "../../../../JsonSchemaContext";
import { prettifyJsonString } from "../../../../Utils";

export function JsonMetadataWithSchemaViewer({
  metadataObject,
  setCurrentMetadataObject,
  setIsValidMetadata,
  canEditJsonMetadata,
}) {
  const monaco = useMonaco();
  const { jsonSchema, jsonSchemaString } = useContext(JsonSchemaContext);
  const [jsonString, setJsonString] = useState("{}");
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
    if (metadataObject) {
      const objectAsString = JSON.stringify(metadataObject);
      const prettyMetadata = prettifyJsonString(objectAsString);
      setJsonString(prettyMetadata);
    }
  }, [metadataObject]);

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

  return (
    <>
      <div>
        <div className={styles.jsonParent}>
          <div className={styles.jsonInputParent}>
            <MonacoEditor
              name={"jsonmetadata"}
              language="json"
              value={jsonString}
              errorMessage={validationError}
              disabled={!canEditJsonMetadata}
              onChange={(e) => {
                setIsValidMetadata(false);
                setJsonString(e);
                if (!checkIfJsonIsParsable(e)) return;
                if (!checkIfFollowsJsonSchema(e)) return;
                setIsValidMetadata(true);
                setCurrentMetadataObject(JSON.parse(e));
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
    </>
  );
}
