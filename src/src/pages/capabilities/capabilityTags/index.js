import React, { useEffect, useContext, useState } from "react";
import "./capabilityTags.module.css";
import AppContext from "AppContext";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { removeNonRequiredJsonSchemaProperties } from "Utils";

/*
 * This component is responsible for rendering the capability tags form.
 * Whenever data is changed, the entire formData passed to the setTagData function.
 * The setTagData function must be passed from the parent component.
 *
 * This component uses the react-jsonschema-form library to render the form.
 * The schema is fetched from the backend and filtered to only show required fields.
 */
export function CapabilityTags({ setTagData }) {
  /*
  const testSchema = {
    title: "Tags",
    type: "object",
    required: ["dfds.cost.center"],
    properties: {
      "dfds.cost.center": {
        enum: [
          "Dummy CostCenter 1",
          "Dummy CostCenter 2",
          "Dummy CostCenter 3",
        ],
      },
    },
  };
  */

  const { selfServiceApiClient } = useContext(AppContext);
  const [showTagForm, setShowTagForm] = useState(true);
  const [schemaString, setSchemaString] = useState("");
  const [schema, setSchema] = useState({});

  const prettifyJsonString = (json) => {
    return JSON.stringify(JSON.parse(json), null, 2);
  };

  useEffect(() => {
    async function getAndSetSchema() {
      if (schemaString === "") {
        const schema =
          await selfServiceApiClient.getCapabilityJsonMetadataSchema();
        setSchemaString(
          prettifyJsonString(removeNonRequiredJsonSchemaProperties(schema)),
        );
      } else {
        console.log("");
        setSchema(JSON.parse(schemaString));
        setShowTagForm(true);
      }
    }
    void getAndSetSchema();
  }, [schemaString]);

  return (
    <>
      {showTagForm ? (
        <Form
          schema={schema}
          validator={validator}
          onChange={(type) => setTagData(type.formData)}
          children={true} // hide submit button
        />
      ) : (
        <p>Loading tag requirements</p>
      )}
    </>
  );
}
