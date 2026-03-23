import React, { useEffect, useContext, useState } from "react";
import PageSection from "@/components/PageSection";
import { Text } from "@/components/ui/Text";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import PreAppContext from "@/preAppContext";
import { useUpdateCapabilityMetadata } from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { TrackedLink } from "@/components/Tracking";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrackedButton } from "@/components/Tracking";
import styles from "./aiCatalogue.module.css";

export function AICatalogueSection({ anchorId }) {
  return (
    <PageSection id={anchorId} headline="AI Catalogue">
      <AICatalogue />
    </PageSection>
  );
}

export function AICatalogue() {
  const { metadata, links, details } = useContext(SelectedCapabilityContext);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const updateCapabilityMetadata = useUpdateCapabilityMetadata();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [canEditTags, setCanEditTags] = useState(false);
  const [aiCatalogueEntries, setAICatalogueEntries] = useState([]);
  const [aiEntryInput, setAIEntryInput] = useState("");

  useEffect(() => {
    if (links && (links?.setRequiredMetadata?.allow || []).includes("POST")) {
      setCanEditTags(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata) {
      const parsedMetadata = JSON.parse(metadata);
      setAICatalogueEntries(
        parsedMetadata["dfds.capability.ai-catalogue-entries"] || [],
      );
    }
  }, [metadata]);

  const handleSubmit = (entries) => {
    if (aiEntryInput.trim() !== "") {
      entries = [...entries, aiEntryInput.trim()];
      setAIEntryInput("");
    }
    updateCapabilityMetadata.mutate(
      {
        capabilityDefinition: details,
        payload: {
          jsonMetadata: {
            ...JSON.parse(metadata || "{}"),
            "dfds.capability.ai-catalogue-entries": entries,
          },
        },
        isCloudEngineerEnabled: isCloudEngineerEnabled,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "metadata", details?.id],
          });
          toast.success("Catalogue updated");
        },
        onError: () => toast.error("Could not save catalogue entries"),
      },
    );
  };

  const handleEntryIDClicked = (entryId) => {
    setAICatalogueEntries(aiCatalogueEntries.filter((i) => i !== entryId));
  };

  const addAICatalogueEntry = (entryId) => {
    setAICatalogueEntries((prev) => [...prev, entryId.trim()]);
    setAIEntryInput("");
  };

  const OnKeyEnter = (e) => {
    if (e.key === "Enter") {
      addAICatalogueEntry(aiEntryInput);
    }
  };

  return (
    <>
      <Text>
        You are seeing this section because this capability has been marked as
        containing AI services.
      </Text>

      <Text>
        Please register all AI services contained within this capability in the
        AI Catalogue. This helps us maintain oversight and ensure compliance
        with relevant regulations.
      </Text>

      <Text>
        To register AI services, please visit the{" "}
        <TrackedLink
          trackName="AICatalogue"
          href={"https://internal.hellman.oxygen.dfds.cloud/aicatalogue/"}
          target="_blank"
          rel="noreferrer"
        >
          AI Catalogue.
        </TrackedLink>
      </Text>

      <Text>
        Lastly please connect the AI Catalogue entries to this capability for
        traceability:
      </Text>

      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-catalogue-input">AI Catalogue IDs</Label>
        <Input
          id="ai-catalogue-input"
          placeholder="Enter AI Catalogue ID"
          value={aiEntryInput}
          onChange={(e) => {
            setAIEntryInput(e.target.value);
          }}
          onKeyDown={OnKeyEnter}
          className={styles.input_field}
        />
      </div>
      <Text className={styles.entries_label}>
        Registered entries:
        {aiCatalogueEntries.length === 0 && " None"}
      </Text>
      <div className={styles.entries_container}>
        {(aiCatalogueEntries || []).map((entryId) => (
          <div
            className={styles.entry_container}
            key={entryId}
            onClick={() => handleEntryIDClicked(entryId)}
          >
            <div className={styles.entry}>{entryId}</div>
            <div className={styles.delete_entry_overlay}>X</div>
          </div>
        ))}
      </div>

      <br />
      <TrackedButton
        trackName="AICatalogueEntries-Submit"
        size="small"
        variation="outlined"
        disabled={!canEditTags}
        onClick={() => {
          handleSubmit(aiCatalogueEntries);
        }}
      >
        Submit
      </TrackedButton>

      <br />
      <Text>
        Note: Currently we do not validate the entered IDs against the AI
        Catalogue. We will add this validation in the future.
      </Text>
    </>
  );
}
