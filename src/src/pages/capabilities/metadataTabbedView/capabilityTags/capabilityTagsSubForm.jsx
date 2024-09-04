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
import JsonSchemaContext from "../../../../JsonSchemaContext";

/*
 * Custom Widgets and Fields
 */

function CustomFieldTemplate(props) {
  const { id, label, required, rawDescription, children, rawErrors } = props;
  const [classNames, setClassNames] = useState(styles.field);
  useEffect(() => {
    if (rawErrors) {
      setClassNames(`${styles.field}`);
    } else {
      setClassNames(`${styles.field}`);
    }
  }, [rawErrors]);

  // Further fields 'errors' and 'help' might come in handy later
  // https://react-jsonschema-form.readthedocs.io/en/v1.8.1/advanced-customization/
  return (
    <div className={classNames}>
      {required ? <span className={styles.bold}>*</span> : null}
      <label htmlFor={id}>{label}</label>
      <br />
      {rawDescription ? (
        <span
          dangerouslySetInnerHTML={{
            __html: rawDescription,
          }}
        />
      ) : null}
      <div className={rawErrors ? styles.fieldError : null} key={id}>
        {children}
      </div>
      <div className={styles.errorMessage}>{rawErrors}</div>
    </div>
  );
}

const CustomDropdown = function (props) {
  const { options, value, onChange, id } = props;
  // remove 'root_' prefix and replace '.' with '-' to have a valid css id
  var cleanId = id.replace(/^[a-zA-Z0-9]*_/, "").replace(/\./g, "-");
  return (
    <Select
      value={options.enumOptions.find((o) => o.value === value)}
      options={options.enumOptions}
      clearable={false}
      onChange={(o) => onChange(o.value)}
      id={cleanId}
    />
  );
};

const CustomCheckbox = function (props) {
  const { onChange } = props;
  const [selectedOption, setSelectedOption] = useState(undefined);

  useEffect(() => {
    onChange(selectedOption);
  }, [selectedOption]);

  return (
    <div>
      <input
        className={styles.checkBox}
        type="checkbox"
        checked={selectedOption === undefined ? false : selectedOption}
        onChange={() =>
          setSelectedOption(
            selectedOption === undefined ? true : !selectedOption,
          )
        }
      />
      <label>True</label>
      <input
        className={styles.checkBox}
        type="checkbox"
        checked={selectedOption === undefined ? false : !selectedOption}
        onChange={() =>
          setSelectedOption(
            selectedOption === undefined ? false : !selectedOption,
          )
        }
      />
      <label>False</label>
    </div>
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
  formRef,
  canEditJsonMetadata,
}) {
  const { jsonSchema, jsonSchemaString, hasJsonSchemaProperties } =
    useContext(JsonSchemaContext);
  const [formData, setFormData] = useState(preexistingFormData);

  const [canEdit, setCanEdit] = useState(canEditJsonMetadata);


  const validateAndSet = (formData) => {
    if (checkIfFollowsJsonSchema(formData, jsonSchemaString)) {
      setValidMetadata(true);
      setMetadata(formData);
    } else {
      setValidMetadata(false);
    }
  };

  useEffect(() => {
    if (hasJsonSchemaProperties) {
      validateAndSet(formData);
    }
  }, [formData]);

  const widgets = {
    SelectWidget: CustomDropdown,
    CheckboxWidget: CustomCheckbox,
  };

  const errorHandler = (parameters) => {
    console.log(parameters);
  };

  return (
    <>
      {label !== "" && <Text className={styles.label}>{label}</Text>}
      <Form
        className={styles.tagsform}
        schema={jsonSchema}
        validator={validator}
        onChange={(type) => setFormData(type.formData)}
        widgets={widgets}
        templates={{ FieldTemplate: CustomFieldTemplate }}
        formData={preexistingFormData}
        children={true} // hide submit button
        ref={formRef}
        showErrorList={false}
        onError={errorHandler}
        disabled={canEdit}
      />
    </>
  );
}
