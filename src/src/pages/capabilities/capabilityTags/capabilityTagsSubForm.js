/*
 * This component is responsible for rendering the capability tags form.
 * Whenever data is changed, the entire formData passed to the setTagData function.
 * The setMetadata function must be passed from the parent component.
 * setValidMetadata: called with true if the form data is valid, false otherwise, whenever data changes.
 *
 * This component uses the react-jsonschema-form library to render the form.
 * The schema is fetched from the backend and filtered to only show required fields.
 */
import React, { useContext, useEffect, useState } from "react";
import { Text } from "@dfds-ui/react-components";
import styles from "./capabilityTags.module.css";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Select from "react-select";
import JsonSchemaContext from "../../../JsonSchemaContext";

/*
 * Custom Widgets and Fields
 */

const CustomDropdown = function (props) {
  const { options, value, onChange } = props;
  return (
    <Select
      value={options.enumOptions.find((o) => o.value === value)}
      options={options.enumOptions}
      clearable={false}
      onChange={(o) => onChange(o.value)}
    />
  );
};

const checkIfFollowsJsonSchema = (data, schema) => {
  const Ajv2020 = require("ajv/dist/2020");
  const addFormats = require("ajv-formats").default;
  const ajv = new Ajv2020();
  addFormats(ajv);
  try {
    const parsed = JSON.parse(schema);
    const validate = ajv.compile(parsed);
    return validate(data);
  } catch (exception) {
    // [andfris] this should never happen, so I am happy with hiding this in the console
    console.log("Schema Exception: " + exception.message);
    return false;
  }
};

export function CapabilityTagsSubForm({
  label,
  setMetadata,
  setValidMetadata,
  preexistingFormData,
}) {
  const {
    hasFilteredJsonSchema,
    filteredJsonSchema,
    filteredJsonSchemaString,
  } = useContext(JsonSchemaContext);
  const [showTagForm, setShowTagForm] = useState(false);
  const [formData, setFormData] = useState({});

  const validateAndSet = (formData) => {
    if (checkIfFollowsJsonSchema(formData, filteredJsonSchemaString)) {
      setValidMetadata(true);
      setMetadata(formData);
    } else {
      setValidMetadata(false);
    }
  };

  useEffect(() => {
    if (hasFilteredJsonSchema) {
      validateAndSet(formData);
    }
  }, [formData, filteredJsonSchemaString]);

  useEffect(() => {
    if (hasFilteredJsonSchema) {
      setShowTagForm(true);
    }
  }, [hasFilteredJsonSchema]);

  const widgets = {
    SelectWidget: CustomDropdown,
  };

  return (
    <>
      {showTagForm && (
        <>
          {label !== "" && <Text className={styles.label}>{label}</Text>}
          <Form
            className={styles.tagsform}
            schema={filteredJsonSchema}
            validator={validator}
            onChange={(type) => setFormData(type.formData)}
            widgets={widgets}
            formData={preexistingFormData}
            children={true} // hide submit button
          />
        </>
      )}
    </>
  );
}
