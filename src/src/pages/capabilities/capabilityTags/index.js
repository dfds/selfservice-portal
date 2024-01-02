import React, { useEffect, useContext, useState } from "react";
import { shallowEqual } from "Utils";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { CapabilityTagsSubForm } from "./capabilityTagsSubForm";
import JsonSchemaContext from "../../../JsonSchemaContext";
import Select from "react-select";

function shallowEqual(object1, object2) {
  try {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

const prettifyJsonString = (json) => {
  return JSON.stringify(JSON.parse(json), null, 2);
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

/*
 * Custom Widgets and Fields
 */

function CustomFieldTemplate(props) {
  const { id, label, required, rawDescription, children } = props;
  return (
    <div className={styles.field}>
      {required ? <span className={styles.bold}>*</span> : null}
      <label htmlFor={id}>{label}</label>
      <br />
      {rawDescription}
      {children}
      {/*errors*/}
      {/*help*/}
    </div>
  );
}

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

const CustomCheckbox = function (props) {
  const { onChange } = props;
  const [selectedOption, setSelectedOption] = useState(undefined);
  let c1 = (Math.random() + 1).toString(36).substring(5);
  let c2 = (Math.random() + 1).toString(36).substring(5);

  useEffect(() => {
    onChange(selectedOption);
  }, [selectedOption]);

  return (
    <div>
      <input
        className={styles.checkBox}
        id={"checkbox-" + c1}
        name={"checkbox-" + c1}
        type="checkbox"
        checked={selectedOption === undefined ? false : selectedOption}
        onChange={() =>
          setSelectedOption(
            selectedOption === undefined ? true : !selectedOption,
          )
        }
      />
      <label htmlFor={"checkbox-" + c1}>True</label>
      <input
        className={styles.checkBox}
        id={"checkbox-" + c2}
        name={"checkbox-" + c2}
        type="checkbox"
        checked={selectedOption === undefined ? false : !selectedOption}
        onChange={() =>
          setSelectedOption(
            selectedOption === undefined ? false : !selectedOption,
          )
        }
      />
      <label htmlFor={"checkbox-" + c2}>False</label>
    </div>
  );
};

/*
 * This component is responsible for rendering the capability tags form.
 * Whenever data is changed, the entire formData passed to the setTagData function.
 * The setMetadata function must be passed from the parent component.
 * setValidMetadata: called with true if the form data is valid, false otherwise, whenever data changes.
 *
 * This component uses the react-jsonschema-form library to render the form.
 * The schema is fetched from the backend and filtered to only show required fields.
 */
export function CapabilityTagsSubForm({
  label,
  setMetadata,
  setHasSchema,
  setValidMetadata,
  preexistingFormData,
}) {
  const { selfServiceApiClient } = useContext(AppContext);
  const [showTagForm, setShowTagForm] = useState(false);
  const [schemaString, setSchemaString] = useState("{}");
  const [schema, setSchema] = useState({});
  const [formData, setFormData] = useState({});

  const validateAndSet = (formData) => {
    if (checkIfFollowsJsonSchema(formData, schemaString)) {
      setValidMetadata(true);
      setMetadata(formData);
    } else {
      setValidMetadata(false);
    }
  };

  useEffect(() => {
    if (schemaString && schemaString !== "{}") {
      validateAndSet(formData);
    }
  }, [formData, schemaString]);

  useEffect(() => {
    async function getAndSetSchema() {
      if (schemaString === "{}") {
        const newSchemaString =
          await selfServiceApiClient.getCapabilityJsonMetadataSchema();

        setSchemaString(
          prettifyJsonString(
            removeNonRequiredJsonSchemaProperties(newSchemaString),
          ),
        );
      } else {
        var updated_schema = JSON.parse(schemaString);
        updated_schema["title"] = ""; // do not render title from schema
        if (!shallowEqual(updated_schema.properties, {})) {
          setSchema(updated_schema);
          setHasSchema(true);
          setShowTagForm(true);
        }
      }
    }
    void getAndSetSchema();
  }, [schemaString]);

  const widgets = {
    SelectWidget: CustomDropdown,
    CheckboxWidget: CustomCheckbox,
  };

  return (
    <>
      {showTagForm && (
        <>
          {label !== "" && <Text className={styles.label}>{label}</Text>}
          <Form
            className={styles.tagsform}
            schema={schema}
            validator={validator}
            onChange={(type) => setFormData(type.formData)}
            widgets={widgets}
            templates={{ FieldTemplate: CustomFieldTemplate }}
            formData={preexistingFormData}
            children={true} // hide submit button
          />
        </>
      )}
    </>
  );
}

export function CapabilityTagViewer() {
  // does set update the backend? How is this done in the metadata view?
  const { metadata, setRequiredCapabilityJsonMetadata, links } = useContext(
    SelectedCapabilityContext,
  );
  const { hasFilteredJsonSchema } = useContext(JsonSchemaContext);
  const [canEditJsonMetadata, setCanEditJsonMetadata] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [formData, setFormData] = useState({});
  const [existingFormData, setExistingFormData] = useState({});

  useEffect(() => {
    if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
      setCanEditJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      setExistingFormData(JSON.parse(metadata));
    }

    if (shallowEqual(formData, existingFormData)) {
      setIsDirty(false);
    } else {
      setIsDirty(true);
    }
  }, [formData, metadata]);

  const submitTags = (formdata) => {
    // do not override non-required metadata fields, should they exist
    var mergedMetaData = { ...existingFormData };
    Object.keys(formdata).forEach((key) => {
      mergedMetaData[key] = formdata[key];
    });

    setRequiredCapabilityJsonMetadata(JSON.stringify(mergedMetaData));
    setIsDirty(false);
  };

  return (
    hasFilteredJsonSchema &&
    canEditJsonMetadata && (
      <>
        <PageSection headline="Capability Tags">
          <CapabilityTagsSubForm
            setMetadata={setFormData}
            setValidMetadata={setIsValid}
            preexistingFormData={existingFormData}
          />

          <ButtonStack align={"right"}>
            <Button
              size="small"
              variation="outlined"
              onClick={() => submitTags(formData)}
              disabled={!(isValid && isDirty)}
            >
              Submit
            </Button>
          </ButtonStack>
        </PageSection>
      </>
    )
  );
}
