import React, { useEffect, useState, useCallback } from "react";
import { Text } from "@dfds-ui/typography";
import {
  Button,
  Card,
  CardContent,
  IconButton,
} from "@dfds-ui/react-components";
import { Accordion, Spinner } from "@dfds-ui/react-components";
import {
  ChevronDown,
  ChevronUp,
  StatusAlert,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@dfds-ui/icons/system";

import Consumer from "./Consumer";
import styles from "./Topics.module.css";
import MessageContractDialog from "./MessageContractDialog";
import { useContext } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import Poles from "components/Poles";
import EditTopicDialog from "./EditTopicDialog";
import DeleteTopicDialog from "./DeleteTopicDialog";
import AppContext from "../../../AppContext";
import { useError } from "../../../hooks/Error";
import MessageContracts from "./MessageContracts";

function TopicHeader({
  name,
  description,
  partitions,
  retention,
  status,
  isOpen,
  onClicked,
}) {
  const handleClick = () => {
    if (onClicked) {
      onClicked();
    }
  };

  const notProvisioned = "Provisioned".toUpperCase() !== status?.toUpperCase();

  return (
    <div
      className={`${styles.topicheader} ${
        isOpen ? styles.topicheaderselected : ""
      }`}
      onClick={notProvisioned ? null : handleClick}
    >
      <div style={{ flexGrow: "1" }}>
        <Text
          className={notProvisioned ? styles.notprovisioned : null}
          styledAs={isOpen ? "actionBold" : "action"}
          style={{ display: "inline-block" }}
        >
          {notProvisioned && (
            <>
              <StatusAlert />
              <span>&nbsp;</span>
            </>
          )}

          {name}

          {notProvisioned && <span>&nbsp;({status?.toLowerCase()})</span>}
        </Text>
      </div>

      <div style={{ width: "20rem" }}>
        <Text styledAs="caption">
          Partitions: {partitions} - Retention: {retention}
        </Text>
      </div>

      <div style={{ width: "5rem", textAlign: "right" }}>
        {isOpen ? (
          <IconButton
            icon={ChevronUp}
            disableTooltip
            disableOverlay
            style={{ color: "white" }}
          />
        ) : (
          <IconButton icon={ChevronDown} disableTooltip disableOverlay />
        )}
      </div>
    </div>
  );
}

export default function Topic({ topic, isSelected, onHeaderClicked }) {
  const { addMessageContractToTopic, updateKafkaTopic, deleteKafkaTopic, validateContract } =
    useContext(SelectedCapabilityContext);
  const { triggerErrorWithTitleAndDetails } = useError();
  const { selfServiceApiClient } = useContext(AppContext);
  const [contracts, setContracts] = useState({});
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);

  const [consumers, setConsumers] = useState([]);
  const [isLoadingConsumers, setIsLoadingConsumers] = useState(false);

  const [contractCount, setContractCount] = useState(0);

  const [selectedMessageContractType, setSelectedMessageContractType] =
    useState(null);
  const [showMessageContractDialog, setShowMessageContractDialog] =
    useState(false);

  const [showEditTopicDialog, setShowEditTopicDialog] = useState(false);
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false);
  const [isEditInProgress, setIsEditInProgress] = useState(false);

  const { id, name, description, partitions, retention, status } = topic;
  const isPublic = name.startsWith("pub.");

  const canAddMessageContracts = (
    topic._links?.messageContracts?.allow || []
  ).includes("POST");
  const allowedToUpdate = !!topic._links?.updateDescription;
  const allowedToDelete = (topic._links?.self?.allow || []).includes("DELETE");

  function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), duration);
    });
  }

  useEffect(() => {
    let isMounted = true;

    if (!isSelected) {
      setContracts({});
      return;
    }

    async function fetchConsumers(topic) {
      const consumers = await selfServiceApiClient.getConsumers(topic);
      if (isMounted) {
        setConsumers(consumers);
        setIsLoadingConsumers(false);
      }
    }

    async function fetchMessageContracts(topic) {
      await fetchContractsAndSetState(topic, isMounted);
    }

    if (isPublic) {
      // TODO: Add localized error handling or at least use error context for these errors
      try {
        void fetchConsumers(topic);
      } catch (e) {
        triggerErrorWithTitleAndDetails("Error", e.message);
      }
      try {
        void fetchMessageContracts(topic);
      } catch (e) {
        triggerErrorWithTitleAndDetails("Error", e.message);
      }
    }

    return () => (isMounted = false);
  }, [topic, isSelected]);

  useEffect(() => {
    setIsLoadingContracts(isSelected);
    setIsLoadingConsumers(isSelected);
  }, [isSelected]);

  const handleHeaderClicked = () => {
    if (onHeaderClicked) {
      onHeaderClicked(id);
    }
  };

  const handleAddMessageContractClicked = () => {
    setShowMessageContractDialog((prev) => !prev);
  };

  const handleMessageHeaderClicked = (messageType) => {
    setSelectedMessageContractType((prev) => {
      if (messageType === prev) {
        return null; // deselect already selected (toggling)
      }

      return messageType;
    });
  };
  const handleRetryClicked = async (messageContract) => {
    try {
      await selfServiceApiClient.retryAddMessageContractToTopic(
        messageContract,
      );
    } catch (e) {
      triggerErrorWithTitleAndDetails("Error", e.message);
    }
  };

  const fetchContractsAndSetState = async (topic, isMounted = true) => {
    const result = await selfServiceApiClient.getMessageContracts(topic);
    result.sort((a, b) => a.messageType.localeCompare(b.messageType));

    if (isMounted) {
      let count = 0;
      let contractsWithVersion = {};
      result.forEach((contract) => {
        if (!contractsWithVersion[contract.messageType]) {
          count += 1;
          contractsWithVersion[contract.messageType] = [];
        }
        contractsWithVersion[contract.messageType].push(contract);
      });

      setContractCount(count);
      setContracts(contractsWithVersion);
      setIsLoadingContracts(false);
    }
  };

  const handleMessageContractValidation = async (contract) => {
    await validateContract( topic.id, contract);
  };



  const handleAddMessageContract = async (formValues) => {
    await addMessageContractToTopic(topic.kafkaClusterId, topic.id, formValues);
    setShowMessageContractDialog(false);
    setIsLoadingContracts(true);
    // UX sleep, nicer to have it busy spin and then show updated list of contracts
    await sleep(1000);
    await fetchContractsAndSetState(topic);
  };

  const handleUpdateTopic = useCallback(
    async (formValues) => {
      setIsEditInProgress(true);
      await updateKafkaTopic(topic.id, formValues);
      setShowEditTopicDialog(false);
      setIsEditInProgress(false); // probably not needed
    },
    [topic],
  );

  const handleDeleteTopic = useCallback(async () => {
    setIsEditInProgress(true);
    await deleteKafkaTopic(topic.id);

    // console.log("hiding edit dialog...");
    // setShowEditTopicDialog(false);
    // setIsEditInProgress(false);
  }, [topic]);

  const header = (
    <TopicHeader
      name={name}
      description={description}
      partitions={partitions}
      retention={retention}
      status={status}
      isOpen={isSelected}
      onClicked={handleHeaderClicked}
    />
  );

  return (
    <Accordion
      header={header}
      isOpen={isSelected}
      onToggle={handleHeaderClicked}
    >
      <Card variant="fill" surface="secondary">
        <CardContent>
          <Poles
            leftContent={<Text styledAs="actionBold">Description</Text>}
            rightContent={
              <>
                {allowedToUpdate && (
                  <IconButton
                    title="Edit"
                    icon={EditIcon}
                    onClick={() => setShowEditTopicDialog(true)}
                  />
                )}
                {allowedToDelete && (
                  <IconButton
                    title="Delete"
                    icon={DeleteIcon}
                    onClick={() => setShowDeleteTopicDialog(true)}
                  />
                )}

                {showEditTopicDialog && (
                  <EditTopicDialog
                    originalTopic={topic}
                    inProgress={isEditInProgress}
                    allowedToUpdate={allowedToUpdate}
                    allowedToDelete={allowedToDelete}
                    onCloseClicked={() => setShowEditTopicDialog(false)}
                    onUpdateClicked={handleUpdateTopic}
                    onDeleteClicked={handleDeleteTopic}
                  />
                )}

                {showDeleteTopicDialog && (
                  <DeleteTopicDialog
                    topicName={topic.name}
                    inProgress={isEditInProgress}
                    allowedToDelete={allowedToDelete}
                    onDeleteClicked={handleDeleteTopic}
                    onCancelClicked={() => setShowDeleteTopicDialog(false)}
                  />
                )}
              </>
            }
          />

          <Text>{description}</Text>

          {/* Consumers currently only fetchable for public topics due to constraints on the API */}
          {isPublic && (
            <>
              <br />
              <Text styledAs="actionBold">Consumers</Text>

              {isLoadingConsumers ? (
                <Spinner instant />
              ) : (
                <>
                  <br />
                  {!(topic._links.consumers.allow || []).includes("GET") && (
                    <div>
                      Only members of capabilities can see public topic
                      consumers.
                    </div>
                  )}

                  {(consumers || []).length === 0 &&
                    (topic._links.consumers.allow || []).includes("GET") && (
                      <div>No one has consumed this topic recently.</div>
                    )}

                  {(consumers || []).map((consumer) => (
                    <Consumer name={consumer} />
                  ))}
                </>
              )}
            </>
          )}

          <br />

          {isPublic && (
            <>
              <br />

              <div className={styles.messagecontractsheader}>
                {showMessageContractDialog && (
                  <MessageContractDialog
                    topicName={name}
                    onCloseClicked={() => setShowMessageContractDialog(false)}
                    onAddClicked={(formValues) =>
                      handleAddMessageContract(formValues)
                    }
                    targetVersion={1}
                  />
                )}
                <Text styledAs="actionBold">
                  Message Contracts ({contractCount})
                </Text>

                {canAddMessageContracts && (
                  <Button
                    size="small"
                    variation="primary"
                    onClick={handleAddMessageContractClicked}
                  >
                    Add
                  </Button>
                )}
              </div>

              {isLoadingContracts ? (
                <Spinner instant />
              ) : (
                <>
                  {contractCount === 0 && (
                    <div>No message contracts defined...yet!</div>
                  )}

                  {Object.entries(contracts).map(
                    ([messageType, messageContracts]) => (
                      <MessageContracts
                        key={messageType}
                        messageType={messageType}
                        contracts={messageContracts}
                        isSelected={messageType === selectedMessageContractType}
                        onHeaderClicked={(messageType) =>
                          handleMessageHeaderClicked(messageType)
                        }
                        onRetryClicked={() =>
                          handleRetryClicked(messageContracts[0])
                        }
                        onAddClicked={(formValues) =>
                          handleAddMessageContract(formValues)
                        }
                        onValidation={(contract)=> handleMessageContractValidation(contract)}
  
                      />
                    ),
                  )}
                </>
              )}

              <br />
            </>
          )}
        </CardContent>
      </Card>
    </Accordion>
  );
}
