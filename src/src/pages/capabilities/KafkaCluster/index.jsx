import React from "react";
import AppContext from "@/AppContext";
import { Text } from "@/components/ui/Text";
import { TextBlock } from "@/components/Text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PageSection from "@/components/PageSection";
import NewTopicDialog from "./NewTopicDialog";
import { useState } from "react";
import { useContext } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import TopicList from "./TopicList";
import { TrackedButton, TrackedLink } from "@/components/Tracking";

export default function KafkaCluster({ anchorId, cluster, capabilityId }) {
  const { setShouldAutoReloadTopics } = useContext(AppContext);
  const {
    id,
    selectedKafkaTopic,
    addTopicToCluster,
    toggleSelectedKafkaTopic,
    getAccessToCluster,
    requestAccessToCluster,
  } = useContext(SelectedCapabilityContext);
  const [showDialog, setShowDialog] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [access, setAccess] = useState({
    server: "",
    username: "",
    password: "",
  });

  const topics = cluster.topics;
  const schemas = cluster.schemas;
  const publicTopics = topics.filter((x) => x.name.startsWith("pub."));
  const privateTopics = topics.filter((x) => !x.name.startsWith("pub."));

  const handleAddTopicToClusterClicked = () => setShowDialog(true);
  const handleCloseTopicFormClicked = () => setShowDialog(false);

  const handleAddTopic = async ({
    name,
    description,
    partitions,
    retention,
  }) => {
    setIsInProgress(true);
    await addTopicToCluster(cluster, {
      name,
      description,
      partitions,
      retention,
    });
    setShouldAutoReloadTopics(true);
    setIsInProgress(false);
    setShowDialog(false);
  };

  const handleGetCredentials = async () => {
    setIsLoadingCredentials(true);
    const access = await getAccessToCluster(cluster);
    console.log(access);
    setAccess(access);
    setShowAccess(true);
    setIsLoadingCredentials(false);
  };

  const handleRequestAccess = async () => {
    setIsRequestingAccess(true);
    await requestAccessToCluster(cluster);
  };

  const handleTopicClicked = (clusterId, topicId) => {
    toggleSelectedKafkaTopic(clusterId, topicId);
  };

  const canRequestAccess = (
    cluster._links?.requestAccess?.allow || []
  ).includes("POST");
  const hasWriteAccess = (cluster?._links?.createTopic?.allow || []).includes(
    "POST",
  );

  return (
    <PageSection
      id={anchorId}
      headline="Kafka"
      headlineChildren={
        <span className="font-mono text-[10px] font-semibold tracking-[0.04em] bg-[rgba(237,136,0,0.1)] text-[#ed8800] px-2 py-[2px] rounded-full ml-2">
          {cluster.name}
        </span>
      }
    >
      {cluster.description && (
        <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-3 whitespace-pre-wrap">
          {cluster.description}
        </p>
      )}

      <Dialog
        open={showAccess}
        onOpenChange={(o) => !o && setShowAccess(false)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[50%] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Connect to cluster</DialogTitle>
          </DialogHeader>
          <div>
            <Text styledAs={"smallHeadline"}>
              In order to connect to the Kafka cluster{" "}
              <TextBlock>
                {cluster.name.toLocaleLowerCase()} ({cluster.id})
              </TextBlock>
              , please use the following configuration:
            </Text>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2 text-left font-bold">Key</th>
                <th className="border px-3 py-2 text-left font-bold">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>bootstrap.servers</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>{access.bootstrapServers}</TextBlock>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>security.protocol</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>SASL_SSL</TextBlock>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>sasl.mechanism</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>PLAIN</TextBlock>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>sasl.username</code>
                </td>
                <td className="border px-3 py-2">
                  See{" "}
                  <TrackedLink
                    trackName="AccessingPlatformCredentials"
                    href="https://wiki.dfds.cloud/en/playbooks/aws-sso#accessing-platform-credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Accessing platform credentials
                  </TrackedLink>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>sasl.password</code>
                </td>
                <td className="border px-3 py-2">
                  See{" "}
                  <TrackedLink
                    trackName="AccessingPlatformCredentials"
                    href="https://wiki.dfds.cloud/en/playbooks/aws-sso#accessing-platform-credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Accessing platform credentials
                  </TrackedLink>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>group.id</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>{capabilityId}.application-name</TextBlock> (
                  <i>example</i>)
                </td>
              </tr>
            </tbody>
          </table>
          <Text>
            <i>
              <strong>Please note</strong> <br />
              That <TextBlock>group.id</TextBlock> <strong>must</strong> be
              prefixed with the capability id (
              <TextBlock>{capabilityId}</TextBlock>) followed by a dot (
              <TextBlock>.</TextBlock>), before the rest of the consumer group
              id, like in the example above.
            </i>
          </Text>
          <Text styledAs={"smallHeadline"}>
            In order to connect to the Schema Registry, please use the following
            configuration:
          </Text>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2 text-left font-bold">Key</th>
                <th className="border px-3 py-2 text-left font-bold">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>schema.registry.url</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>{access.schemaRegistryUrl}</TextBlock>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>schema.registry.basic.auth.credentials.source</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>USER_INFO</TextBlock>
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 break-all">
                  <code>schema.registry.basic.auth.user.info</code>
                </td>
                <td className="border px-3 py-2">
                  <TextBlock>username:password</TextBlock> (See{" "}
                  <TrackedLink
                    trackName="AccessingPlatformCredentials"
                    href="https://wiki.dfds.cloud/en/playbooks/aws-sso#accessing-platform-credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Accessing platform credentials
                  </TrackedLink>
                  )
                </td>
              </tr>
            </tbody>
          </table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccess(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showDialog && (
        <NewTopicDialog
          capabilityId={id}
          clusterName={cluster.name.toLocaleLowerCase()}
          inProgress={isInProgress}
          onAddClicked={handleAddTopic}
          onCloseClicked={handleCloseTopicFormClicked}
        />
      )}

      {hasWriteAccess && (
        <div className="flex gap-2 flex-wrap items-center mb-4">
          <TrackedButton
            trackName="TopicCreate-ShowDialog"
            size="small"
            onClick={handleAddTopicToClusterClicked}
          >
            Add topic
          </TrackedButton>
          <TrackedButton
            trackName="Topic-HowToConnect"
            size="small"
            variation="outlined"
            submitting={isLoadingCredentials}
            onClick={handleGetCredentials}
          >
            How to connect?
          </TrackedButton>
        </div>
      )}

      <TopicList
        name="Public Topics"
        topics={publicTopics}
        clusterId={cluster.id}
        selectedTopic={selectedKafkaTopic}
        onTopicClicked={handleTopicClicked}
        schemas={schemas}
      />

      {hasWriteAccess && (
        <TopicList
          name="Private Topics"
          topics={privateTopics}
          clusterId={cluster.id}
          selectedTopic={selectedKafkaTopic}
          onTopicClicked={handleTopicClicked}
          schemas={schemas}
        />
      )}

      {canRequestAccess && (
        <div className="flex gap-2 flex-wrap items-center mt-3">
          <TrackedButton
            trackName="KafkaCluster-RequestClusterAccess"
            size="small"
            submitting={isRequestingAccess}
            onClick={handleRequestAccess}
          >
            Request Access
          </TrackedButton>
        </div>
      )}
    </PageSection>
  );
}
