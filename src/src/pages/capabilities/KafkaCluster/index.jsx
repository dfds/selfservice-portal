import React from "react";
import AppContext from "AppContext";
import { Text } from "@dfds-ui/typography";
import { TextBlock } from "components/Text";
import { ButtonStack, Badge } from "@dfds-ui/react-components";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableDataCell,
} from "@dfds-ui/react-components";
import { Modal } from "@dfds-ui/modal";
import PageSection from "components/PageSection";
import NewTopicDialog from "./NewTopicDialog";
import { useState } from "react";
import { useContext } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import TopicList from "./TopicList";
import styles from "./index.module.css";
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
  const clusterDescription = (cluster.description || "")
    .split("\n")
    .map((x, i) => <Text key={i}>{x}</Text>);

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
        <div className={styles.headlineContainer}>
          <span>({cluster.name.toLocaleLowerCase()})</span>
          <div className={styles.badges}>
            <Badge className={styles.badge}>
              ID: <span>{cluster.id}</span>
            </Badge>
          </div>
        </div>
      }
    >
      <Text styledAs="label">Description</Text>
      {clusterDescription}

      <Modal
        heading={"Connect to cluster"}
        isOpen={showAccess}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setShowAccess(false);
        }}
        sizes={{
          s: "50%",
          m: "50%",
          l: "50%",
          xl: "50%",
          xxl: "50%",
        }}
      >
        <div>
          <Text styledAs={"smallHeadline"}>
            In order to connect to the Kafka cluster{" "}
            <TextBlock>
              {cluster.name.toLocaleLowerCase()} ({cluster.id})
            </TextBlock>
            , please use the following configuration:
          </Text>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Key</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableDataCell>
                <code>bootstrap.servers</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>{access.bootstrapServers}</TextBlock>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>security.protocol</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>SASL_SSL</TextBlock>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>sasl.mechanism</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>PLAIN</TextBlock>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>sasl.username</code>
              </TableDataCell>
              <TableDataCell>
                See{" "}
                <TrackedLink
                  trackName="AccessingPlatformCredentials"
                  href="https://wiki.dfds.cloud/en/playbooks/aws-sso#accessing-platform-credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accessing platform credentials
                </TrackedLink>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>sasl.password</code>
              </TableDataCell>
              <TableDataCell>
                See{" "}
                <TrackedLink
                  trackName="AccessingPlatformCredentials"
                  href="https://wiki.dfds.cloud/en/playbooks/aws-sso#accessing-platform-credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accessing platform credentials
                </TrackedLink>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>group.id</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>{capabilityId}.application-name</TextBlock> (
                <i>example</i>)
              </TableDataCell>
            </TableRow>
          </TableBody>
        </Table>
        <Text>
          <i>
            <strong>Please note</strong> <br />
            That <TextBlock>group.id</TextBlock> <strong>must</strong> be
            prefixed with the capability id (
            <TextBlock>{capabilityId}</TextBlock>) followed by a dot (
            <TextBlock>.</TextBlock>), before the rest of the consumer group id,
            like in the example above.
          </i>
        </Text>
        <Text styledAs={"smallHeadline"}>
          In order to connect to the Schema Registry, please use the following
          configuration:
        </Text>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Key</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableDataCell>
                <code>schema.registry.url</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>{access.schemaRegistryUrl}</TextBlock>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>schema.registry.basic.auth.credentials.source</code>
              </TableDataCell>
              <TableDataCell>
                <TextBlock>USER_INFO</TextBlock>
              </TableDataCell>
            </TableRow>
            <TableRow>
              <TableDataCell>
                <code>schema.registry.basic.auth.user.info</code>
              </TableDataCell>
              <TableDataCell>
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
              </TableDataCell>
            </TableRow>
          </TableBody>
        </Table>
      </Modal>

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
        <ButtonStack align="left">
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
        </ButtonStack>
      )}

      <br />

      <TopicList
        name="Public Topics"
        topics={publicTopics}
        clusterId={cluster.id}
        selectedTopic={selectedKafkaTopic}
        onTopicClicked={handleTopicClicked}
        schemas={schemas}
      />
      <br />

      {hasWriteAccess && (
        <>
          <TopicList
            name="Private Topics"
            topics={privateTopics}
            clusterId={cluster.id}
            selectedTopic={selectedKafkaTopic}
            onTopicClicked={handleTopicClicked}
            schemas={schemas}
          />
          <br />
        </>
      )}

      {canRequestAccess && (
        <ButtonStack align="right">
          <TrackedButton
            trackName="KafkaCluster-RequestClusterAccess"
            size="small"
            submitting={isRequestingAccess}
            onClick={handleRequestAccess}
          >
            Request Access
          </TrackedButton>
        </ButtonStack>
      )}
    </PageSection>
  );
}
