import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import Poles from "../../../components/Poles";
import { Text } from "@dfds-ui/typography";
import { SelectField, Switch } from "@dfds-ui/react-components";
import React, { useEffect, useState } from "react";
import { Divider } from "@dfds-ui/react-components/divider";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { StatusAlert, StatusError } from "@dfds-ui/icons/system";
import { Button } from "@dfds-ui/react-components";
import { prettifyJsonString } from "../../../Utils";

function JsonViewer({ json }) {
  return (
    <div className={styles.messagecontent}>
      <SyntaxHighlighter
        language="json"
        style={syntaxStyle}
        wrapLongLines={false}
        customStyle={{
          margin: "0",
          padding: "0",
          border: "1px solid #ccc",
          height: "370px",
        }}
      >
        {prettifyJsonString(json)}
      </SyntaxHighlighter>
    </div>
  );
}

export const MessageStatus = {
  PROVISIONED: "Provisioned",
  FAILED: "Failed",
  IN_PROGRESS: "In Progress",
  REQUESTED: "Requested",
};

function MessageHeader({
  messageType,
  isOpen,
  status,
  canRetry,
  onRetryClicked,
}) {
  const [showRetry, setShowRetry] = useState(canRetry);
  const [shownStatus, setShownStatus] = useState(MessageStatus.IN_PROGRESS);
  const [isPendingCreation, setIsPendingCreation] = useState(
    status === MessageStatus.REQUESTED || status === MessageStatus.IN_PROGRESS,
  );

  useEffect(() => {
    if (status) {
      setShownStatus(status);
    }
  }, [status]);

  useEffect(() => {
    if (shownStatus) {
      setIsPendingCreation(
        shownStatus === MessageStatus.REQUESTED ||
          shownStatus === MessageStatus.IN_PROGRESS,
      );
    }
  }, [shownStatus]);

  const textClass = (pendingCreation, s) => {
    if (isPendingCreation) {
      return styles.pendingcreation;
    }
    if (s === MessageStatus.FAILED) {
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
        className={textClass(isPendingCreation, shownStatus)}
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

export default function MessageContracts({
  messageType,
  contracts,
  onRetryClicked,
  isSelected,
  onHeaderClicked,
}) {
  const [canExpand, setCanExpand] = useState(false);
  const [headerStatus, setHeaderStatus] = useState(MessageStatus.PROVISIONED);
  const [selectedContract, setSelectedContract] = useState([]);
  const [shownContracts, setShownContracts] = useState([]);
  const [showSchema, setShowSchema] = useState(false);
  const handleToggleSchema = () => {
    setShowSchema((prev) => !prev);
  };

  useEffect(() => {
    if (contracts) {
      setShownContracts(contracts);
      if (contracts.length === 1) {
        setCanExpand(contracts[0].status === MessageStatus.PROVISIONED);
        setHeaderStatus(contracts[0].status);
      } else if (contracts.length > 1) {
        setCanExpand(true);
      }
    }
  }, [contracts]);

  const headerClickHandler = () => {
    if (onHeaderClicked) {
      onHeaderClicked(messageType);
      const minContractVer = Math.min(
        ...contracts.map((item) => item.schemaVersion),
      );
      setSelectedContract(
        contracts.find((x) => x.schemaVersion === minContractVer),
      );
    }
  };

  const setShownContract = (contractId) => {
    setSelectedContract(contracts.find((x) => x.id === contractId));
  };

  const changeSelectedSchemaVersion = (e) => {
    e.preventDefault();
    setShownContract(e?.target?.value || selectedContract);
  };

  const getHeader = (s) => (
    <>
      <MessageHeader
        messageType={messageType}
        isOpen={isSelected && canExpand}
        status={s}
        canRetry={false}
        onRetryClicked={onRetryClicked}
      />
      <Divider />
    </>
  );

  return (
    <div className={styles.container}>
      <Expandable
        header={getHeader(headerStatus)}
        isOpen={isSelected && canExpand}
        onHeaderClicked={headerClickHandler}
      >
        <div className={styles.contentcontainer}>
          <SelectField
            name="version"
            label="Version"
            value={selectedContract.id}
            required
            onChange={changeSelectedSchemaVersion}
          >
            {shownContracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                Version {contract.schemaVersion}
              </option>
            ))}
          </SelectField>
          <div className={styles.jsoncontainer}>
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
            {selectedContract.description}

            <br />
            <Text styledAs="label">{showSchema ? "Schema" : "Example"}</Text>
            <JsonViewer
              json={
                showSchema ? selectedContract.schema : selectedContract.example
              }
            />
          </div>
        </div>
      </Expandable>
    </div>
  );
}
