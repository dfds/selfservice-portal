import { useEffect, useState, useContext } from "react";
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
import { nnfxDark as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SelectedCapabilityContext from "../SelectedCapabilityContext";

import toJsonSchema from "to-json-schema";
import { prettifyJsonString } from "../../../Utils";

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
  const [messageType, setMessageType] = useState("");
  const [typeError, setTypeError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");

  const [previewSchema, setPreviewSchema] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewAsSchema, setPreviewAsSchema] = useState(false);

  const [isInProgress, setIsInProgress] = useState(false);
  const [isUsingOpenContentModel, setIsUsingOpenContentModel] = useState(false);
  const { validateContract } = useContext(SelectedCapabilityContext);
  const [isValidationInProgress, setIsValidationInProgress] = useState(false);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  const checkRequiredFields = async () => {
    const allWithValues = isAllWithValues([messageType, description, message]);
    const hasError = !isAllEmptyValues([
      typeError,
      descriptionError,
      messageError,
    ]);
    if (allWithValues && !hasError && hasBeenValidated) {
      return true;
    } else {
      setMessageError(getValidationErrorForMessage(message));
      setDescriptionError(getValidationErrorForDescription(description));
      setTypeError(getValidationErrorForType(messageType));
      return false;
    }
  };

  useEffect(() => {
    if (evolveContract) {
      setMessageType(evolveContract.messageType);
      setMessage(
        prettifyJsonString(
          JSON.stringify(JSON.parse(evolveContract.example).data),
        ),
      );
    } else {
      setHasBeenValidated(true);
    }
  }, [evolveContract]);

  useEffect(() => {
    let error = "";
    if (messageType !== "") {
      error = getValidationErrorForType(messageType);
    }
    setTypeError(error);
  }, [messageType]);

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

  useEffect(() => {
    isAllWithValues([messageType, description, message]);
    isAllEmptyValues([typeError, descriptionError, messageError]);
  }, [
    messageType,
    description,
    message,
    typeError,
    descriptionError,
    messageError,
    hasBeenValidated,
  ]);

  // update previews
  useEffect(() => {
    let messageValue = message;
    messageValue = ensureHasEnvelope(messageValue, messageType, targetVersion);

    // update schema preview
    try {
      const json = JSON.parse(messageValue);
      const result = toJsonSchema(json, {
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
                ...{ additionalProperties: isUsingOpenContentModel },
              };
        },
      });

      result["required"] = ["messageId", "type", "data", "schemaVersion"];
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
  }, [messageType, message, isUsingOpenContentModel]);

  const changeType = (e) => {
    e?.preventDefault();
    let newTopic = e?.target?.value || "";
    newTopic = newTopic.replace(/\s+/g, "-");
    setMessageType(newTopic.toLowerCase());
  };

  const changeDescription = (e) => {
    e?.preventDefault();
    const newValue = e?.target?.value || "";
    setDescription(newValue);
  };

  const changeMessage = (e) => {
    e?.preventDefault();
    const newValue = e?.target?.value || "";
    if (newValue !== message && evolveContract) {
      setHasBeenValidated(false);
    }
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

  const hasMessageError = () => messageError !== "";

  const handleAddClicked = async () => {
    if (onAddClicked) {
      setIsInProgress(true);

      const validForm = await checkRequiredFields();

      if (validForm) {
        await onAddClicked({
          messageType: messageType,
          description: description,
          example: previewMessage,
          schema: previewSchema,
        });
      }
      setIsInProgress(false);
    }
  };

  const handleValidateClicked = async () => {
    setIsValidationInProgress(true);
    const validationResult = await validateContract(
      evolveContract.kafkaTopicId,
      messageType,
      previewSchema,
    );

    if (!validationResult.isContractValid) {
      setMessageError(validationResult.failureReason || "failed to validate");
    } else {
      setHasBeenValidated(true);
    }
    setIsValidationInProgress(false);
  };

  return (
    <SideSheet
      header={
        evolveContract
          ? `Evolve message contract...`
          : `Add message contract...`
      }
      onRequestClose={handleCloseClicked}
      isOpen={true}
      width="50%"
      alignSideSheet="right"
      variant="elevated"
      backdrop
    >
      <SideSheetContent>
        {evolveContract ? (
          <Text>
            Evolve your message contract by introducing a new version. By
            default, the message that you define below is wrapped in the DFDS
            message envelope and it is recommended that you continue to use that
            for your messages - you can see a full preview of you final message
            payload on the right.
          </Text>
        ) : (
          <Text>
            Add a new message contract to your topic{" "}
            <span className={styles.topicname}>{topicName}</span> by filling in
            your information below. By default, the message that you define
            below is wrapped in the DFDS message envelope and it is recommended
            that you continue to use that for your messages - you can see a full
            preview of you final message payload on the right.
          </Text>
        )}

        <br />

        <TextField
          label="Type"
          placeholder="Enter message type (e.g. order-has-been-placed)"
          required
          value={messageType}
          help="The message type is recommended to be the name of a domain event (e.g. order-has-been-placed) that would signal that a specific event has occured within your domain. On a technical level it will act as a discriminator to identify and distinguish between different types of messages produced to the same topic. It is recommended to use the kebab-case as the naming convention (words in lower case separated by dashes e.g. order-has-been-placed) and domain events would be phrased in past tense. None of these recommendations are technically enforced, but please remember that they WILL become part of your message contract."
          onChange={changeType}
          errorMessage={typeError}
          readOnly={evolveContract ? true : false}
          cursor={evolveContract ? "auto" : "text"}
        />

        <br />

        <TextField
          label={evolveContract ? "Describe reason for change" : "Description"}
          placeholder={
            evolveContract ? "Enter a reason" : "Enter a description"
          }
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
          {evolveContract ? (
            <Button
              variation="primary"
              submitting={isValidationInProgress}
              onClick={handleValidateClicked}
              disabled={hasMessageError()}
              style={{
                position: "right",
                backgroundColor: hasBeenValidated ? "#4caf50" : "#ED8800",
                pointerEvents: hasBeenValidated ? "none" : "auto",
              }}
            >
              {hasBeenValidated ? "Valid Contract" : "Validate"}
            </Button>
          ) : (
            <></>
          )}

          <Button
            variation="primary"
            disabled={!hasBeenValidated}
            submitting={isInProgress}
            onClick={handleAddClicked}
          >
            {evolveContract ? "Evolve" : "Add"}
          </Button>
          <Button variation="outlined" onClick={handleCloseClicked}>
            Cancel
          </Button>
        </ButtonStack>
      </SideSheetContent>
    </SideSheet>
  );
}
