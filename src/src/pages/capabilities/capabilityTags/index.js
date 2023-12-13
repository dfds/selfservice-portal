import React, { useEffect, useContext, useState } from "react";
import styles from "./capabilityTags.module.css";
import AppContext from "AppContext";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { removeNonRequiredJsonSchemaProperties } from "Utils";
import { Button, ButtonStack } from "@dfds-ui/react-components";
import PageSection from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import Select from 'react-select';

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

const CustomDropdown = function (props) {
  const { options, value, onChange } = props;
  return (
    <Select
      options={options.enumOptions}
      clearable={false}
      onChange={(o) => onChange(o.value)}
    >
      {value}
    </Select>
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
  title,
  setMetadata,
  setValidMetadata,
  preexistingFormData,
}) {
  const { selfServiceApiClient } = useContext(AppContext);
  const [showTagForm, setShowTagForm] = useState(true);
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
        // quick hack to change the title of the form, instead of changing the schema itself
        var updated_schema = JSON.parse(schemaString);
        updated_schema["title"] = title;
        setSchema(updated_schema);
        setShowTagForm(true);
      }
    }
    void getAndSetSchema();
  }, [schemaString]);
  
  /*
  const customUiSchema = {
    'dfds.cost.centre' : {
      'ui.help': 'FLUTTERSHY: This is a help text',
      'ui.title': "RAINBOWDASH"
    }
  }

  const test = {
    dfds: {cost: {centre: {
      "ui:help": "This is a help text",
      "ui:title": "This is a title",
      "ui:widget": "string",
    }}}
  }
  */
  /*
  function CustomFieldTemplate(props) {
    console.log(props);
    const {id, classNames, label, help, required, description, errors, children} = props;
    return (
      <div className={classNames}>
        <label htmlFor={id}>{label}HEST{required ? "!!" : null}</label>
        {description}
        {children}
        {errors}
        {help}
      </div>
    );
  }
  */

  const widgets = {
    SelectWidget: CustomDropdown,
  };

  //const theme = { templates: { FieldTemplate: CustomFieldTemplate } };
  //const Form = withTheme(theme);

  return (
    <>
      {showTagForm ? (
        <Form
          //fields={fields}
          //uiSchema={test}
          className={styles.tagsform}
          schema={schema}
          validator={validator}
          onChange={(type) => setFormData(type.formData)}
          formData={preexistingFormData}
          widgets={widgets}
          children={true} // hide submit button
        />
      ) : (
        // [andfris] let's see if we need a spinner
        <p>Loading tag requirements</p>
      )}
    </>
  );
}

export function CapabilityTagViewer() {
  // does set update the backend? How is this done in the metadata view?
  const { metadata, setCapabilityJsonMetadata } = useContext(
    SelectedCapabilityContext,
  );

  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const [formData, setFormData] = useState({});
  const [existingFormData, setExistingFormData] = useState({});

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

    setCapabilityJsonMetadata(JSON.stringify(mergedMetaData));
    setIsDirty(false);
  };

  return (
    <>
      <PageSection headline="Capability Tags">
        <CapabilityTagsSubForm
          title=""
          setMetadata={setFormData}
          setValidMetadata={setIsValid}
          preexistingFormData={existingFormData}
        />

        <br />

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
  );
}
