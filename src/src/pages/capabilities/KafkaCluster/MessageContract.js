import React, { useEffect, useState } from "react";
import { Text } from "@dfds-ui/typography";
import { Button, Switch } from "@dfds-ui/react-components";
import styles from "./MessageContract.module.css";
import SyntaxHighlighter from "react-syntax-highlighter";
import Expandable from "components/Expandable";
import Poles from "components/Poles";
import { Divider } from "@dfds-ui/react-components/divider";
import { StatusAlert, StatusError } from "@dfds-ui/icons/system";

export const MessageStatus = {
  PROVISIONED: "Provisioned",
  FAILED: "Failed",
  IN_PROGRESS: "In Progress",
  REQUESTED: "Requested",
};

export function MessageHeader({
  messageType,
  isOpen,
  status,
  canRetry,
  onRetryClicked,
}) {
  const [showRetry, setShowRetry] = useState(canRetry);
  const [shownStatus, setShownStatus] = useState(status);

  const isPendingCreation =
    shownStatus === MessageStatus.REQUESTED ||
    status === MessageStatus.IN_PROGRESS;

  const textClass = () => {
    if (isPendingCreation) {
      return styles.pendingcreation;
    }
    if (shownStatus === MessageStatus.FAILED) {
      return styles.failed;
    }
    return null;
  };

  const onRetryButtonClicked = () => {
    onRetryClicked();
    setShowRetry(false);
    setShownStatus(MessageStatus.REQUESTED);
  };

  return (
    <div
      className={`${styles.header} ${isOpen ? styles.headerselected : null}`}
    >
      <Text
        className={textClass()}
        styledAs={isOpen ? "bodyInterfaceBold" : "bodyInterface"}
      >
        {isPendingCreation && (
          <>
            <StatusAlert />
            <span>&nbsp;</span>
          </>
        )}
        {shownStatus === MessageStatus.FAILED && (
          <>
            <StatusError />
            <span>&nbsp;</span>
          </>
        )}

        {messageType}

        {shownStatus !== MessageStatus.PROVISIONED && (
          <span>&nbsp;({shownStatus?.toLowerCase()})&nbsp;&nbsp;</span>
        )}
        {shownStatus === MessageStatus.FAILED && { showRetry } && (
          <Button
            size="small"
            variation={"outlined"}
            onClick={onRetryButtonClicked}
          >
            Retry
          </Button>
        )}
      </Text>
    </div>
  );
}

function JsonViewer({ json }) {
  return (
    <div className={styles.messagecontent}>
      <SyntaxHighlighter
        language="json"
        customStyle={{ backgroundColor: "#fff", padding: "0" }}
      >
        {json}
      </SyntaxHighlighter>
    </div>
  );
}

export default function Message({
  id,
  messageType,
  description,
  example,
  schema,
  status,
  _links,
  onRetryClicked,
  isSelected,
  onHeaderClicked,
}) {
  const [showSchema, setShowSchema] = useState(false);
  useEffect(() => {
    setShowSchema(false);
  }, [id, isSelected]);

  const handleToggleSchema = () => {
    setShowSchema((prev) => !prev);
  };

  const headerClickHandler = () => {
    if (onHeaderClicked) {
      onHeaderClicked(id);
    }
  };

  const header = (
    <>
      <MessageHeader
        messageType={messageType}
        isOpen={isSelected && status === MessageStatus.PROVISIONED}
        status={status}
        canRetry={_links?.retry != null}
        onRetryClicked={onRetryClicked}
      />
      <Divider />
    </>
  );

  let descriptionElement = <Text>{description}</Text>;
  if ((description || "") === "") {
    descriptionElement = (
      <Text>
        <i style={{ color: "#999" }}>[description is missing] </i>
      </Text>
    );
  }

  return (
    <div className={styles.container}>
      <Expandable
        header={header}
        isOpen={isSelected && status === MessageStatus.PROVISIONED}
        onHeaderClicked={headerClickHandler}
      >
        <div className={styles.contentcontainer}>
          <Poles
            leftContent={
              <Text styledAs="label" style={{ marginBottom: "0" }}>
                Description
              </Text>
            }
            rightContent={
              <Poles
                leftContent={
                  <Text styledAs="caption">Show JSON Schema &nbsp;</Text>
                }
                rightContent={
                  <Switch
                    size="small"
                    checked={showSchema}
                    onChange={handleToggleSchema}
                  />
                }
              />
            }
          />
          {descriptionElement}

          <br />
          <Text styledAs="label">{showSchema ? "Schema" : "Example"}</Text>
          <JsonViewer json={showSchema ? schema : example} />
        </div>
      </Expandable>
    </div>
  );
}
