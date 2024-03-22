import { createContext, useContext, useEffect, useState } from "react";
import { prettifyJsonString, shallowEqual } from "./Utils";
import AppContext from "./AppContext";

const JsonSchemaContext = createContext();

function JsonSchemaProvider({ children }) {
  const { selfServiceApiClient } = useContext(AppContext);

  const [fetchJsonSchema, setFetchJsonSchema] = useState(true);
  const [jsonSchema, setJsonSchema] = useState({});
  const [jsonSchemaString, setJsonSchemaString] = useState("{}");
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
        hasJsonSchemaProperties,
      }}
    >
      {children}
    </JsonSchemaContext.Provider>
  );
}

export { JsonSchemaContext as default, JsonSchemaProvider };
