import React, { useEffect, useState, useContext, useMemo } from "react";
import AppContext from "../../AppContext";
import { Spinner } from "@dfds-ui/react-components";
import Message from "../capabilities/KafkaCluster/MessageContract";
import { Text } from "@dfds-ui/typography";
import { Card, CardContent, IconButton } from "@dfds-ui/react-components";
import { Link } from "react-router-dom";

export function RowDetails(data) {
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [selectedMessageContractId, setSelectedMessageContractId] =
    useState(null);
  const { selfServiceApiClient } = useContext(AppContext);

  useEffect(() => {
    fetchData(data);
  }, []);

  async function fetchData(topic) {
    setIsLoadingContracts(true);
    const result = await selfServiceApiClient.getMessageContracts(topic.data);
    result.sort((a, b) => a.messageType.localeCompare(b.messageType));
    setContracts(result);
    setIsLoadingContracts(false);
  }

  const handleMessageHeaderClicked = (messageId) => {
    setSelectedMessageContractId((prev) => {
      if (messageId === prev) {
        return null; // deselect already selected (toggling)
      }

      return messageId;
    });
  };

  const linkStyle = {
    color: "#1874bc",
    textDecoration: "none",
  };

  return (
    <Card variant="fill" surface="secondary">
      <CardContent>
        <Text styledAs="actionBold">Description</Text>
        <p>{data.data.description}</p>
        {
          <>
            <br />
            {isLoadingContracts ? (
              <Spinner instant />
            ) : (
              <>
                {(contracts || []).length === 0 && (
                  <div>No message contracts defined...yet!</div>
                )}

                {(contracts || []).length !== 0 && (
                  <Text styledAs="actionBold">
                    Message Contracts ({(contracts || []).length})
                  </Text>
                )}

                {(contracts || []).map((messageContract) => (
                  <Message
                    key={messageContract.id}
                    {...messageContract}
                    isSelected={
                      messageContract.id === selectedMessageContractId
                    }
                    onHeaderClicked={(id) => handleMessageHeaderClicked(id)}
                  />
                ))}
              </>
            )}
          </>
        }
        <br />
        <div>
          <div>
            <Text styledAs="actionBold">Capability </Text>
            <Link
              style={linkStyle}
              to={`/capabilities/${data.data.capabilityId}`}
            >
              {data.data.capabilityId}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
