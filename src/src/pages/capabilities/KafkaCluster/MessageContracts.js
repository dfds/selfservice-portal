import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import Poles from "../../../components/Poles";
import { Text } from "@dfds-ui/typography";
import { SelectField, Switch } from "@dfds-ui/react-components";
import React, { useEffect, useState } from "react";
import { MessageHeader, MessageStatus } from "./MessageContract";
import { Divider } from "@dfds-ui/react-components/divider";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs as syntaxStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

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
        {json}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageContracts({
  id,
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
      setSelectedContract(contracts.find((x) => x.Id === id));
    }
  };

  useEffect(() => {
    console.log(selectedContract);
  }, [selectedContract]);

  const setShownContract = (contractId) => {
    setSelectedContract(contracts.find((x) => x.id === contractId));
  };

  const changeSelectedSchemaVersion = (e) => {
    e.preventDefault();
    setShownContract(e?.target?.value || selectedContract);
  };

  const getHeader = (headerStatus) => (
    <>
      <MessageHeader
        messageType={messageType}
        isOpen={isSelected && canExpand}
        status={headerStatus}
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
          <div className={styles.contentcontainer2}>
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
