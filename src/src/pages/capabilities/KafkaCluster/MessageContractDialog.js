import { useEffect, useState } from "react";
import { Text } from "@dfds-ui/typography";
import {
  Button,
  ButtonStack,
  SideSheet,
  SideSheetContent,
} from "@dfds-ui/react-components";
import styles from "./MessageContractDialog.module.css";
import { Switch, TextareaField, TextField } from "@dfds-ui/forms";
import SyntaxHighlighter from "react-syntax-highlighter";
// import { codepenEmbed as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { nnfxDark as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

import toJsonSchema from "to-json-schema";

function getValidationErrorForType(value) {
  // matching backend validation
  const isNameValid =
    value !== "" &&
    !value.match(/^\s*$/g) &&
    !value.match(/([_-])$/g) &&
    !value.match(/^([_-])/g) &&
    !value.match(/[-_.]{2,}/g) &&
    !value.match(/[^a-zA-Z0-9\-_]/g);

  if (value.length > 0 && !isNameValid) {
    return 'Allowed characters are a-z, 0-9, "-", and "_" and it must not start or end with "_" or "-". Do not use more than one of "-" or "_" in a row.';
  }

  const isValid = value !== "" && value.length > 0;
  return isValid ? "" : "Type is invalid";
}

function getValidationErrorForDescription(value) {
  const isValid =
    value !== undefined && value != null && value !== "" && value.length > 0;

  return isValid ? "" : "Please write a description to communicate your intent";
}

function getValidationErrorForMessage(value) {
  try {
    const obj = JSON.parse(value);
    if (Object.keys(obj).length === 0) {
      return "Message cannot be an empty object";
    }
    return "";
  } catch (err) {
    return err.message;
  }
}

function isAllEmptyValues(data) {
  let result = true;
  data.forEach((x) => {
    if (x !== "") {
      result = false;
    }
  });
  return result;
}

function isAllWithValues(data) {
  let result = true;
  data.forEach((x) => {
    if (x === undefined || x == null || x === "") {
      result = false;
    }
  });
  return result;
}

function ensureHasEnvelope(message, type, targetVersion) {
  let newValue = message;
  try {
    const data = JSON.parse(newValue);
    const hasEnvelope =
      data.hasOwnProperty("messageId") &&
      data.hasOwnProperty("type") &&
      data.hasOwnProperty("data") &&
      data.hasOwnProperty("schemaVersion");

    if (!hasEnvelope) {
      const envelope = {
        messageId: "<123>",
        type: type || "<type>",
        data: data,
        schemaVersion: targetVersion,
      };

      newValue = JSON.stringify(envelope, null, 2);
    }
  } catch {}
  return newValue;
}

export default function MessageContractDialog({
  topicName,
  onAddClicked,
  onCloseClicked,
  targetVersion,
  evolveContract,
}) {
  const [type, setType] = useState("");
  const [typeError, setTypeError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");

  const [previewSchema, setPreviewSchema] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewAsSchema, setPreviewAsSchema] = useState(false);

  const [canAdd, setCanAdd] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isUsingOpenContentModel, setIsUsingOpenContentModel] = useState(false);

  useEffect(() => {
    if(evolveContract){
      setType(evolveContract.messageType);
      setMessage(evolveContract.schema)
      // setMessage

    }
  },[evolveContract])

  useEffect(() => {
    let error = "";
    if (type !== "") {
      error = getValidationErrorForType(type);
    }
    setTypeError(error);
  }, [type]);

  useEffect(() => {
    let error = "";
    if (description !== "") {
      error = getValidationErrorForDescription(description);
    }
    setDescriptionError(error);
  }, [description]);

  useEffect(() => {
    let error = "";
    if (message !== "") {
      error = getValidationErrorForMessage(message);
    }
    setMessageError(error);
  }, [message]);

  // toggle add button
  useEffect(() => {
    const allWithValues = isAllWithValues([type, description, message]);
    const hasError = !isAllEmptyValues([
      typeError,
      descriptionError,
      messageError,
    ]);

    if (allWithValues && !hasError) {
      setCanAdd(true);
    } else {
      setCanAdd(false);
    }
  }, [type, description, message, typeError, descriptionError, messageError]);

  // update previews
  useEffect(() => {
    let messageValue = message;
    messageValue = ensureHasEnvelope(messageValue, type, targetVersion);

    // update schema preview
    try {
      const json = JSON.parse(messageValue);
      const result = toJsonSchema(json, {
        required: true,
        postProcessFnc: (type, schema, value, defaultFunc) => {
          return type !== "object"
            ? {
                ...schema,
                ...{
                  examples: type === "array" ? value : [value],
                  // required: true
                },
              }
            : {
                ...defaultFunc(type, schema, value),
                ...{ required: Object.getOwnPropertyNames(value) },
                ...{ additionalProperties: isUsingOpenContentModel },
              };
        },
      });

      // NOTE: not well documented how to insert const into using toJsonSchema, so just inserting afterward
      result["properties"]["schemaVersion"] = {
        type: "integer",
        const: targetVersion,
      };
      const text = JSON.stringify(result, null, 2);
      setPreviewSchema(text);
    } catch {
      setPreviewSchema("");
    }

    // update message preview
    try {
      const json = JSON.parse(messageValue);
      const text = JSON.stringify(json, null, 2);
      setPreviewMessage(text);
    } catch {
      setPreviewMessage("");
    }
  }, [type, message, isUsingOpenContentModel]);

  const changeType = (e) => {
    e?.preventDefault();
    let newTopic = e?.target?.value || "";
    newTopic = newTopic.replace(/\s+/g, "-");
    setType(newTopic);
  };

  const changeDescription = (e) => {
    e?.preventDefault();
    const newValue = e?.target?.value || "";
    setDescription(newValue);
  };

  const changeMessage = (e) => {
    e?.preventDefault();
    const newValue = e?.target?.value || "";
    setMessage(newValue);
  };

  const changePreviewAsSchema = (e) => {
    setPreviewAsSchema((prev) => !prev);
  };
  const changeIsOpenContentModel = (e) => {
    setIsUsingOpenContentModel((prev) => !prev);
  };
  const handleCloseClicked = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
  };

  const handleAddClicked = async () => {
    if (onAddClicked) {
      setIsInProgress(true);

      // NOTE: [jandr] handle errors
      await onAddClicked({
        messageType: type,
        description: description,
        example: previewMessage,
        schema: previewSchema,
      });
      // setIsInProgress(false);
    }
  };

  return (
    <SideSheet
      header={`Add message contract...`}
      onRequestClose={handleCloseClicked}
      isOpen={true}
      width="50%"
      alignSideSheet="right"
      variant="elevated"
      backdrop
    >
      <SideSheetContent>
        <Text>
          Add a new message contract to your topic{" "}
          <span className={styles.topicname}>{topicName}</span> by filling in
          your information below. By default, the message that you define below
          is wrapped in the DFDS message envelope and it is recommended that you
          continue to use that for your messages - you can see a full preview of
          you final message payload on the right.
        </Text>

        <br />

        <TextField
          label="Type"
          placeholder="Enter message type (e.g. order-has-been-placed)"
          required
          value={type}
          help="The message type is recommended to be the name of a domain event (e.g. order-has-been-placed) that would signal that a specific event has occured within your domain. On a technical level it will act as a discriminator to identify and distinguish between different types of messages produced to the same topic. It is recommended to use the kebab-case as the naming convention (words in lower case separated by dashes e.g. order-has-been-placed) and domain events would be phrased in past tense. None of these recommendations are technically enforced, but please remember that they WILL become part of your message contract."
          onChange={changeType}
          errorMessage={typeError}
        />

        <br />

        <TextField
          label="Description"
          placeholder="Enter a description"
          required
          value={description}
          onChange={changeDescription}
          errorMessage={descriptionError}
        />

        <br />

        <div className={styles.columns}>
          <div className={styles.column}>
            <TextareaField
              label="Message"
              placeholder="Enter a JSON example of your message"
              required
              style={{ height: "30rem" }}
              value={message}
              onChange={changeMessage}
              errorMessage={messageError}
            />
            <Switch
              checked={isUsingOpenContentModel}
              onChange={changeIsOpenContentModel}
            >
              Open Content Model (See{" "}
              <a
                href={
                  "https://yokota.blog/2021/03/29/understanding-json-schema-compatibility/"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                link
              </a>
              )
            </Switch>
          </div>
          <div className={styles.column}>
            <Text as={"label"} styledAs="label" style={{ color: "#002b45" }}>
              Preview final{" "}
              <i style={{ fontWeight: "bolder" }}>
                {previewAsSchema ? "schema" : "message"}
              </i>
            </Text>
            <div
              style={{
                height: "30rem",
                border: "1px solid #4d4e4cb3",
                overflowY: "auto",
                display: "flex",
                alignItems: "stretch",
              }}
            >
              <SyntaxHighlighter
                language="json"
                style={syntaxStyle}
                wrapLongLines={false}
                customStyle={{
                  backgroundColor: "#002b45",
                  padding: "0.75rem",
                  margin: "0",
                  width: "100%",
                }}
              >
                {previewAsSchema ? previewSchema : previewMessage}
              </SyntaxHighlighter>
            </div>
            <Switch checked={previewAsSchema} onChange={changePreviewAsSchema}>
              As JSON schema
            </Switch>
          </div>
        </div>

        <br />

        <ButtonStack>
          <Button
            variation="primary"
            disabled={!canAdd}
            submitting={isInProgress}
            onClick={handleAddClicked}
          >
            Add
          </Button>
          <Button variation="outlined" onClick={handleCloseClicked}>
            Cancel
          </Button>
        </ButtonStack>
      </SideSheetContent>
    </SideSheet>
  );
}
