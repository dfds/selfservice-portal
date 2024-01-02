import { createContext, useContext, useEffect, useState } from "react";
import {
  prettifyJsonString,
  removeNonRequiredJsonSchemaProperties,
  shallowEqual,
} from "./Utils";
import AppContext from "./AppContext";

const JsonSchemaContext = createContext();

function JsonSchemaProvider({ children }) {
  const { selfServiceApiClient } = useContext(AppContext);

  const [fetchJsonSchema, setFetchJsonSchema] = useState(true);
  const [jsonSchema, setJsonSchema] = useState({});
  const [jsonSchemaString, setJsonSchemaString] = useState("{}");
  const [filteredJsonSchema, setFilteredJsonSchema] = useState({});
  const [filteredJsonSchemaString, setFilteredJsonSchemaString] =
    useState("{}");
  const [hasFilteredJsonSchema, setHasFilteredJsonSchema] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setFetchJsonSchema(false);
      const fetchedSchema =
        await selfServiceApiClient.getCapabilityJsonMetadataSchema();
      setJsonSchemaString(prettifyJsonString(fetchedSchema));
      setJsonSchema(JSON.parse(fetchedSchema));
      const filtered = removeNonRequiredJsonSchemaProperties(fetchedSchema);
      const schemaObject = JSON.parse(filtered);

      if (!shallowEqual(schemaObject.properties, {})) {
        schemaObject["title"] = ""; // do not render title from schema
        setHasFilteredJsonSchema(true);
        setFilteredJsonSchema(schemaObject);
        const prettified = prettifyJsonString(JSON.stringify(schemaObject));
        setFilteredJsonSchemaString(prettified);
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
        filteredJsonSchema,
        filteredJsonSchemaString,
        hasFilteredJsonSchema,
      }}
    >
      {children}
    </JsonSchemaContext.Provider>
  );
}

export { JsonSchemaContext as default, JsonSchemaProvider };
