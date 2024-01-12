import styles from "./MessageContract.module.css";
import Expandable from "../../../components/Expandable";
import Poles from "../../../components/Poles";
import { Text } from "@dfds-ui/typography";
import { SelectField, Switch } from "@dfds-ui/react-components";
import React, { useEffect, useState } from "react";
import { MessageHeader, MessageStatus } from "./MessageContract";
import { Divider } from "@dfds-ui/react-components/divider";

export default function MessageContracts({
  messageType,
  contracts,
  onRetryClicked,
  isSelected,
  onHeaderClicked,
}) {
  const [canExpand, setCanExpand] = useState(false);
  const [headerStatus, setHeaderStatus] = useState(MessageStatus.PROVISIONED);
  const [selectedContract, setSelectedContract] = useState(0);
  const [shownDescription, setShownDescription] = useState("");
  const [shownContracts, setShownContracts] = useState([]);

  useEffect(() => {
    if (contracts) {
      setShownContracts(contracts);
      if (contracts.length === 1) {
        console.log("status", contracts[0]);
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
      setSelectedContract(0);
      setSelectedContract(1);
    }
  };

  const setShownContract = (contractVersion) => {
    if (contractVersion !== selectedContract) {
      setSelectedContract(contractVersion);
      setShownDescription(contracts[contractVersion - 1].description);
    }
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
            value={selectedContract}
            required
            onChange={changeSelectedSchemaVersion}
          >
            {shownContracts.map((contract) => (
              <option key={contract} value={contract.schemaVersion}>
                Version {contract.schemaVersion}
              </option>
            ))}
          </SelectField>
          {shownDescription}
        </div>
      </Expandable>
    </div>
  );
}
