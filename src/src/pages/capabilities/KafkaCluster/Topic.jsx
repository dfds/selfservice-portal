import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { useContext } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import EditTopicDialog from "./EditTopicDialog";
import DeleteTopicDialog from "./DeleteTopicDialog";
import MessageContracts from "./MessageContracts";
import ConsumerLink from "@/components/ConsumerLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";

function TopicHeader({
  name,
  description,
  partitions,
  retention,
  status,
  isOpen,
  onClicked,
}) {
  const provisioned = status === "Provisioned";
  const notProvisioned = !provisioned;

  return (
    <div
      className={`flex items-center gap-3 py-2.5 border-b border-divider transition-colors ${
        provisioned ? "cursor-pointer" : ""
      } ${isOpen ? "bg-[#f2f2f2] dark:bg-slate-700" : "hover:bg-[#f2f2f2] dark:hover:bg-slate-700"}`}
      onClick={notProvisioned ? null : onClicked}
    >
      <div className="flex-1 min-w-0">
        <span
          className={`font-mono text-[12px] font-medium ${
            notProvisioned ? "text-muted" : "text-primary"
          }`}
        >
          {notProvisioned && (
            <AlertCircle className="inline h-3 w-3 mr-1 flex-shrink-0" />
          )}
          {name}
          {notProvisioned && (
            <span className="ml-1 text-[11px]">({status?.toLowerCase()})</span>
          )}
        </span>
      </div>
      <div className="font-mono text-[11px] text-muted flex-shrink-0">
        {partitions} partitions · {retention}
      </div>
      <div className="flex-shrink-0 w-4 flex justify-center">
        {provisioned &&
          (isOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          ))}
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
    setSelectedSchemaId((prev) => (id === prev ? null : id));
  };

  const fetchSchemasAndSetState = async (topicName, schemas) => {
    var filteredSchemas = schemas.filter((schema) =>
      schema.subject.includes(topicName),
    );
    setFilteredSchemas(filteredSchemas);
    setSchemasCount(filteredSchemas.length);
  };

  const handleUpdateTopic = useCallback(
    async (formValues) => {
      setIsEditInProgress(true);
      await updateKafkaTopic(topic.id, formValues);
      setShowEditTopicDialog(false);
      setIsEditInProgress(false);
    },
    [topic],
  );

  const handleDeleteTopic = useCallback(async () => {
    setIsEditInProgress(true);
    await deleteKafkaTopic(topic.id);
  }, [topic]);

  return (
    <div>
      <TopicHeader
        name={name}
        description={description}
        partitions={partitions}
        retention={retention}
        status={status}
        isOpen={isSelected}
        onClicked={handleHeaderClicked}
      />

      {isSelected && (
        <div className="bg-[#f8f9fa] dark:bg-[#1e293b] border-b border-divider px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Description</SectionLabel>
            <div className="flex items-center gap-1">
              {allowedToUpdate && (
                <IconButton
                  title="Edit"
                  onClick={() => setShowEditTopicDialog(true)}
                >
                  <Pencil className="h-3.5 w-3.5 text-secondary" />
                </IconButton>
              )}
              {allowedToDelete && (
                <IconButton
                  title="Delete"
                  onClick={() => setShowDeleteTopicDialog(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-secondary" />
                </IconButton>
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
            </div>
          </div>

          <p className="text-[13px] text-secondary leading-[1.6] mb-4">
            {description}
          </p>

          <div className="flex items-center justify-between mb-2 mt-4">
            <SectionLabel>Schemas ({schemasCount})</SectionLabel>
          </div>
          {schemasCount === 0 && (
            <EmptyState className="mb-3">No schemas are defined for this topic</EmptyState>
          )}
          {Object.entries(filteredSchemas).map(([elem, schema]) => (
            <MessageContracts
              key={schema.id}
              schema={schema}
              isSelected={schema.id === selectedSchemaId}
              onHeaderClicked={(type) => handleMessageHeaderClicked(type)}
            />
          ))}

          <div className="mt-4">
            <SectionLabel>Consumer Statistics</SectionLabel>
            <div className="mt-1">
              <ConsumerLink
                capabilityId={topic.capabilityId}
                topicName={topic.name}
                linkTitle="Open consumer dashboard in Grafana"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
