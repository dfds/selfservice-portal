import React, { useState, useContext } from "react";
import { Modal, ModalAction } from "@dfds-ui/modal";
import { Text } from "@dfds-ui/typography";
import AppContext from "../../AppContext";
import Select from "react-select";
import {
  ENUM_COSTCENTER,
  BUSINESS_CAPABILITIES_BY_COSTCENTER,
} from "@/constants/tagConstants";
import UserEmailsModal from "../UserEmailsModal";

export default function ExtractEmailsModal({
  isOpen,
  onClose,
  availableRoles,
  availableCapabilities,
}) {
  const { selfServiceApiClient } = useContext(AppContext);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedCostCentres, setSelectedCostCentres] = useState([]);
  const [selectedBusinessCapabilities, setSelectedBusinessCapabilities] =
    useState([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(null);
  const [showEmailsModal, setShowEmailsModal] = useState(false);

  const roleOptions = (availableRoles || []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const costCentreOptions = ENUM_COSTCENTER.map((cc) => ({
    value: cc.value,
    label: cc.label,
  }));

  // Get all unique business capabilities from hardcoded constants
  const businessCapabilityOptions = React.useMemo(() => {
    const allBusinessCaps = new Map();

    Object.values(BUSINESS_CAPABILITIES_BY_COSTCENTER).forEach((capList) => {
      capList.forEach((cap) => {
        if (!allBusinessCaps.has(cap.value)) {
          allBusinessCaps.set(cap.value, {
            value: cap.value,
            label: cap.label,
          });
        }
      });
    });

    return Array.from(allBusinessCaps.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, []);

  // Get capability options from available capabilities
  const capabilityOptions = (availableCapabilities || []).map((cap) => ({
    value: cap.id,
    label: cap.name,
  }));

  const handleExtract = async () => {
    setIsLoading(true);
    try {
      const roles = selectedRoles.map((r) => r.value);
      const costCentres = selectedCostCentres.map((cc) => cc.value);
      const businessCapabilities = selectedBusinessCapabilities.map(
        (bc) => bc.value,
      );
      const capabilities = selectedCapabilities.map((c) => c.value);
      const result = await selfServiceApiClient.getUserEmails(
        roles,
        costCentres,
        businessCapabilities,
        capabilities,
      );
      setUsers(result);
      setShowEmailsModal(true);
    } catch (error) {
      console.error("Failed to fetch user emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowEmailsModal(false);
  };

  const handleCloseAll = () => {
    setShowEmailsModal(false);
    setUsers(null);
    onClose();
    setSelectedRoles([]);
    setSelectedCostCentres([]);
    setSelectedBusinessCapabilities([]);
    setSelectedCapabilities([]);
  };

  return (
    <>
      <Modal
        heading={"Extract User Emails"}
        isOpen={isOpen && !showEmailsModal}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={true}
        showClose={true}
        fixedTopPosition={true}
        onRequestClose={onClose}
      >
        <div style={{ marginBottom: "1rem" }}>
          <Text styledAs="labelBold">Filter by Roles:</Text>
          <Select
            isMulti
            value={selectedRoles}
            onChange={setSelectedRoles}
            options={roleOptions}
            placeholder="Select roles..."
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Text styledAs="labelBold">Filter by Cost Centres:</Text>
          <Select
            isMulti
            value={selectedCostCentres}
            onChange={setSelectedCostCentres}
            options={costCentreOptions}
            placeholder="Select cost centres..."
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Text styledAs="labelBold">Filter by Business Capabilities:</Text>
          <Select
            isMulti
            value={selectedBusinessCapabilities}
            onChange={setSelectedBusinessCapabilities}
            options={businessCapabilityOptions}
            placeholder="Select business capabilities..."
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Text styledAs="labelBold">Filter by Capabilities:</Text>
          <Select
            isMulti
            value={selectedCapabilities}
            onChange={setSelectedCapabilities}
            options={capabilityOptions}
            placeholder="Select capabilities..."
          />
        </div>

        <br />
        <ModalAction
          style={{ float: "right", marginRight: "1rem" }}
          actionVariation="primary"
          onClick={handleExtract}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Extract Emails"}
        </ModalAction>
      </Modal>

      <UserEmailsModal
        isOpen={showEmailsModal}
        onClose={handleCloseAll}
        onBack={handleBack}
        users={users}
        isLoading={isLoading}
      />
    </>
  );
}
