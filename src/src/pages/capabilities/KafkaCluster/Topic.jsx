import React, { useEffect, useState, useCallback } from "react";
import { Text } from "@/components/dfds-ui/typography";
import {
  Button,
  Card,
  CardContent,
  IconButton,
} from "@/components/dfds-ui/react-components";
import { Accordion, Spinner } from "@/components/dfds-ui/react-components";
import {
  ChevronDown,
  ChevronUp,
  StatusAlert,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@/components/dfds-ui/icons/system";

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

  const TopicStatus = {
    PROVISIONED: "Provisioned",
  };

  const provisioned = status === TopicStatus.PROVISIONED;
  const notProvisioned = !provisioned;

  return (
    <div
      className={`${styles.topicheader} ${
        isOpen ? styles.topicheaderselected : null
      } ${provisioned ? styles.cursorPointer : null}`}
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
        {provisioned && isOpen ? (
          <IconButton
            icon={ChevronUp}
            disableTooltip
            disableOverlay
            style={{ color: "white" }}
          />
        ) : (
          provisioned && (
            <IconButton icon={ChevronDown} disableTooltip disableOverlay />
          )
        )}
      </div>
    </div>
  );
}

export default function Topic({ topic, isSelected, onHeaderClicked, schemas }) {
  const { updateKafkaTopic, deleteKafkaTopic } = useContext(
    SelectedCapabilityContext,
  );
  const [filteredSchemas, setFilteredSchemas] = useState({});

  const [schemasCount, setSchemasCount] = useState(0);

  const [selectedSchemaId, setSelectedSchemaId] = useState(null);

  const [showEditTopicDialog, setShowEditTopicDialog] = useState(false);
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false);
  const [isEditInProgress, setIsEditInProgress] = useState(false);

  const { id, name, description, partitions, retention, status } = topic;

  const allowedToUpdate = !!topic._links?.updateDescription;
  const allowedToDelete = (topic._links?.self?.allow || []).includes("DELETE");

  useEffect(() => {
    if (!isSelected) {
      setFilteredSchemas({});
      return;
    }

    fetchSchemasAndSetState(name, schemas);
  }, [topic, isSelected]);

  const handleHeaderClicked = () => {
    if (onHeaderClicked) {
      onHeaderClicked(id);
    }
  };

  const handleMessageHeaderClicked = (id) => {
    setSelectedSchemaId((prev) => {
      if (id === prev) {
        return null; // deselect already selected (toggling)
      }

      return id;
    });
  };

  const fetchSchemasAndSetState = async (topicName, schemas) => {
    var filteredSchemas = schemas.filter((schema) => {
      return schema.subject.includes(topicName);
    });
    setFilteredSchemas(filteredSchemas);
    setSchemasCount(filteredSchemas.length);
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

          {
            <>
              <br />

              <div className={styles.messagecontractsheader}>
                <Text styledAs="actionBold">Schemas ({schemasCount})</Text>
              </div>
              {schemasCount === 0 && (
                <div>No schemas are defined for this topic</div>
              )}

              {Object.entries(filteredSchemas).map(([elem, schema]) => (
                <MessageContracts
                  key={schema.id}
                  schema={schema}
                  isSelected={schema.id === selectedSchemaId}
                  onHeaderClicked={(type) => handleMessageHeaderClicked(type)}
                />
              ))}

              <br />
            </>
          }
        </CardContent>
      </Card>
    </Accordion>
  );
}
