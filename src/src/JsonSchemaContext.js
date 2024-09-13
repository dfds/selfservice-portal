import { createContext, useContext, useEffect, useState } from "react";
import { prettifyJsonString, shallowEqual } from "./Utils";
import AppContext from "./AppContext";

const JsonSchemaContext = createContext();

function JsonSchemaProvider({ children }) {
  const { selfServiceApiClient } = useContext(AppContext);

  const [fetchJsonSchema, setFetchJsonSchema] = useState(true);
  const [jsonSchema, setJsonSchema] = useState({});
  const [jsonSchemaString, setJsonSchemaString] = useState("{}");
  const [mandatoryJsonSchema, setMandatoryJsonSchema] = useState({});
  const [optionalJsonSchema, setOptionalJsonSchema] = useState({});
  const [hasJsonSchemaProperties, setHasJsonSchemaProperties] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setFetchJsonSchema(false);
      const fetchedSchema =
        await selfServiceApiClient.getCapabilityJsonMetadataSchema();
      var schemaObject = JSON.parse(fetchedSchema);
      schemaObject["title"] = ""; // do not render title from schema
      setJsonSchemaString(prettifyJsonString(fetchedSchema));
      setJsonSchema(schemaObject);

      if (!shallowEqual(schemaObject.properties, {})) {
        setHasJsonSchemaProperties(true);
      }

      const splitSchema = (schema) => {
        const requiredFields = schema.required || [];
        const properties = schema.properties || {};

        // Mandatory schema
        const mandatoryProperties = Object.keys(properties).reduce(
          (acc, key) => {
            if (requiredFields.includes(key)) {
              acc[key] = properties[key];
            }
            return acc;
          },
          {},
        );

        const mandatorySchema = {
          $schema: schema.$schema,
          type: schema.type,
          properties: mandatoryProperties,
          required: requiredFields,
        };

        // Optional schema
        const optionalProperties = Object.keys(properties).reduce(
          (acc, key) => {
            if (!requiredFields.includes(key)) {
              acc[key] = properties[key];
            }
            return acc;
          },
          {},
        );

        const optionalSchema = {
          $schema: schema.$schema,
          type: schema.type,
          properties: optionalProperties,
        };

        setMandatoryJsonSchema(mandatorySchema);
        setOptionalJsonSchema(optionalSchema);
      };

      splitSchema(schemaObject);
    }

    if (fetchJsonSchema) {
      void fetchData();
    }
  }, [fetchJsonSchema]);

  return (
    <JsonSchemaContext.Provider
      value={{
        jsonSchema,
        jsonSchemaString,
        mandatoryJsonSchema,
        optionalJsonSchema,
        hasJsonSchemaProperties,
      }}
    >
      {children}
    </JsonSchemaContext.Provider>
  );
}

export { JsonSchemaContext as default, JsonSchemaProvider };
