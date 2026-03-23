import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../AppContext";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import MessageContracts from "../capabilities/KafkaCluster/MessageContracts";
import { useError } from "../../hooks/Error";

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
        return null;
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

  function MessageContractTypeRow({ messageType, messageContracts }) {
    return (
      <div className="mt-3">
        <div className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b] mb-1">
          {messageType}
        </div>
        <div>
          {messageContracts.map((contract, i) => (
            <MessageContracts
              key={contract.schema?.id ?? i}
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
    <div className="pt-[0.875rem]">
      {data.data.description && (
        <p className="text-[13px] text-[#666666] dark:text-[#94a3b8] leading-[1.6] mb-[0.875rem]">
          {data.data.description}
        </p>
      )}

      <div className="flex flex-wrap gap-5">
        {data.data.partitions != null && (
          <div className="flex flex-col gap-[2px]">
            <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b]">
              Partitions
            </span>
            <span className="font-mono text-[12px] text-[#002b45] dark:text-[#e2e8f0]">
              {data.data.partitions}
            </span>
          </div>
        )}
        {data.data.retention && (
          <div className="flex flex-col gap-[2px]">
            <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b]">
              Retention
            </span>
            <span className="font-mono text-[12px] text-[#002b45] dark:text-[#e2e8f0]">
              {data.data.retention}
            </span>
          </div>
        )}
        {data.data.capabilityId && (
          <div className="flex flex-col gap-[2px]">
            <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b]">
              Capability
            </span>
            <Link
              className="font-mono text-[12px] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline"
              to={`/capabilities/${data.data.capabilityId}`}
            >
              {data.data.capabilityId}
            </Link>
          </div>
        )}
      </div>

      {isLoadingContracts && <Spinner size="sm" className="mt-3" />}

      {Object.entries(contractsGroupedByVersion).map(
        ([messageType, messageContracts]) => (
          <MessageContractTypeRow
            key={messageType}
            messageType={messageType}
            messageContracts={messageContracts}
          />
        ),
      )}
    </div>
  );
}
