import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../AppContext";
import { Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { Card, CardContent } from "@dfds-ui/react-components";
import { Link } from "react-router-dom";
import MessageContracts from "../capabilities/KafkaCluster/MessageContracts";
import { useError } from "../../hooks/Error";
import ConsumerLink from "@/components/ConsumerLink";

export function RowDetails(data) {
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [selectedMessageContractType, setSelectedMessageContractType] =
    useState(null);
  const [contractsGroupedByVersion, setContractsGroupedByVersion] = useState(
    [],
  );
  const { selfServiceApiClient } = useContext(AppContext);
  const { triggerErrorWithTitleAndDetails } = useError();

  useEffect(() => {
    fetchData(data);
  }, []);

  useEffect(() => {
    if (contracts || contracts.length === 0) {
      let contractsWithVersion = {};
      contracts.forEach((contract) => {
        if (!contractsWithVersion[contract.messageType]) {
          contractsWithVersion[contract.messageType] = [];
        }
        contractsWithVersion[contract.messageType].push(contract);
      });
      Object.entries(contractsWithVersion).forEach(([key, value]) => {
        value.sort(
          (a, b) => parseInt(a.schemaVersion) - parseInt(b.schemaVersion),
        );
      });

      setContractsGroupedByVersion(contractsWithVersion);
    }
  }, [contracts]);

  async function fetchData(topic) {
    setIsLoadingContracts(true);
    const result = await selfServiceApiClient.getMessageContracts(topic.data);
    result.sort((a, b) => a.messageType.localeCompare(b.messageType));
    setContracts(result);
    setIsLoadingContracts(false);
  }

  const handleMessageHeaderClicked = (messageType) => {
    setSelectedMessageContractType((prev) => {
      if (messageType === prev) {
        return null; // deselect already selected (toggling)
      }
      return messageType;
    });
  };

  const linkStyle = {
    color: "#1874bc",
    textDecoration: "none",
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

  function MessageContractTypeRow({ messageType, messageContracts }) {
    return (
      <div>
        <h4>{messageType}</h4>
        <div>
          {messageContracts.map((contract) => (
            <MessageContracts
              key={contract.schema.id}
              schema={contract.schema}
              isSelected={messageType === selectedMessageContractType}
              onHeaderClicked={(messageType) =>
                handleMessageHeaderClicked(messageType)
              }
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card variant="fill" surface="secondary">
      <CardContent>
        <Text styledAs="actionBold">Description</Text>
        <p>{data.data.description}</p>
        <br />

        <Text styledAs="actionBold">Capability </Text>
        <Link style={linkStyle} to={`/capabilities/${data.data.capabilityId}`}>
          {data.data.capabilityId}
        </Link>
        {/*<br />

        <Text styledAs="actionBold">Consumer Statistics</Text>
        <ConsumerLink
          capabilityId={data.data.capabilityId}
          topicName={data.data.name}
          linkTitle="Open consumer dashboard in Grafana"
        />*/}
      </CardContent>
    </Card>
  );
}
