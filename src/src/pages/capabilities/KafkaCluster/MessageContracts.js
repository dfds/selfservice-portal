import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import Poles from "../../../components/Poles";
import { Text } from "@dfds-ui/typography";
import { SelectField, Switch } from "@dfds-ui/react-components";
import React, { useEffect, useState } from "react";
import { Divider } from "@dfds-ui/react-components/divider";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  StatusAlert,
  StatusError,
  ChevronDown,
  ChevronUp,
} from "@dfds-ui/icons/system";
import { Button } from "@dfds-ui/react-components";
import { prettifyJsonString } from "../../../Utils";
import MessageContractDialog from "./MessageContractDialog";

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
      className={`${styles.header} ${isOpen ? styles.headerselected : null} ${
        !isPendingCreation ? styles.pointerCursor : null
      }`}
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
      {!isPendingCreation && !isOpen && (
        <ChevronDown className={styles.chevronSize} />
      )}
      {!isPendingCreation && isOpen && (
        <ChevronUp className={styles.chevronSize} />
      )}
    </div>
  );
}

export default function MessageContracts({
  messageType,
  contracts,
  onRetryClicked,
  isSelected,
  onHeaderClicked,
  onAddClicked,
}) {
  const [canExpand, setCanExpand] = useState(false);
  const [headerStatus, setHeaderStatus] = useState(MessageStatus.PROVISIONED);
  const [selectedContract, setSelectedContract] = useState([]);
  const [shownContracts, setShownContracts] = useState([]);
  const [showSchema, setShowSchema] = useState(false);
  const handleToggleSchema = () => {
    setShowSchema((prev) => !prev);
  };
  const [showMessageContractDialog, setShowMessageContractDialog] =
    useState(false);
  const [maxContractVer, setMaxContractVer] = useState(0);

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
      const maxContractVer = Math.max(
        ...contracts.map((item) => item.schemaVersion),
      );
      setSelectedContract(
        contracts.find((x) => x.schemaVersion === maxContractVer),
      );
      setMaxContractVer(maxContractVer);
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

  const handleAddClicked = (contract) => {
    setShowMessageContractDialog((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <Expandable
        header={getHeader(headerStatus)}
        isOpen={isSelected && canExpand}
        onHeaderClicked={headerClickHandler}
      >
        <div className={styles.contentcontainer}>
          <div className={styles.version}>
            <SelectField
              name="version"
              label="Version"
              value={selectedContract.id}
              required
              onChange={changeSelectedSchemaVersion}
              style={{ width: "20rem" }}
            >
              {shownContracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {`Version${contract.schemaVersion}${
                    contract.status !== "Provisioned"
                      ? ` (${contract.status})`
                      : ""
                  }`}
                </option>
              ))}
            </SelectField>
            {onAddClicked && (
              <Button
                variation="primary"
                disabled={
                  selectedContract.status !== "Provisioned" ? true : false
                }
                size="small"
                // submitting={isInProgress}
                onClick={handleAddClicked}
              >
                Evolve
              </Button>
            )}
          </div>

          {showMessageContractDialog && (
            <MessageContractDialog
              // topicName={}
              onCloseClicked={() => setShowMessageContractDialog(false)}
              onAddClicked={onAddClicked}
              targetVersion={maxContractVer + 1}
              evolveContract={contracts.find(
                (x) => x.schemaVersion === maxContractVer,
              )}
            />
          )}
          <div className={styles.jsoncontainer}>
            <Poles
              leftContent={
                <Text
                  styledAs="label"
                  style={
                    selectedContract.status !== "Provisioned"
                      ? { opacity: 0.25, marginBottom: "0" }
                      : { marginBottom: "0" }
                  }
                >
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
            <Text
              style={
                selectedContract.status !== "Provisioned"
                  ? { opacity: 0.25 }
                  : {}
              }
            >
              {selectedContract.description}
            </Text>

            <br />
            <div
              style={
                selectedContract.status !== "Provisioned"
                  ? { opacity: 0.25 }
                  : {}
              }
            >
              <Text styledAs="label">{showSchema ? "Schema" : "Example"}</Text>
              <JsonViewer
                json={
                  showSchema
                    ? selectedContract.schema
                    : selectedContract.example
                }
              />
            </div>
          </div>
        </div>
      </Expandable>
    </div>
  );
}
