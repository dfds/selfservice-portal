import React, { useContext, useState } from "react";
import styles from "./members.module.css";
import { Text } from "@dfds-ui/typography";
import ProfilePicture from "./profilepicture";
import { TabbedPageSection } from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { CapabilityInvitations } from "../capabilityInvitations/capabilityInvitations";
import { useMembershipApplications } from "@/state/remote/queries/membershipApplications";
import { Account } from "@dfds-ui/icons/system";
import Select from "react-select";
import { useGrantRole } from "@/state/remote/queries/rbac";

function MemberRow({ member, roleTypes }) {
  const { id: capabilityId, userIsOwner } = useContext(
    SelectedCapabilityContext,
  );
  const { myProfile: user } = useContext(AppContext);
  const { mutate: grantRoleMutation } = useGrantRole();
  const [selectedRole, setSelectedRole] = useState(member.role);

  const grantRole = (memberEmail, roleId) => {
    grantRoleMutation({
      payload: {
        roleId: roleId,
        assignedEntityType: "User",
        assignedEntityId: memberEmail,
        type: "Capability",
        resource: capabilityId,
      },
    });
  };

  return (
    <div key={member.id} className={styles.memberRow}>
      {member.pictureUrl !== "" && member.pictureUrl !== undefined ? (
        <img
          src={member.pictureUrl}
          className={styles.memberPicture}
          alt="profile"
        />
      ) : (
        <Account className={styles.memberPicture} />
      )}
      {/* Info about the element */}
      <div className={styles.memberInfo}>
        <span>Name: {member.name}</span>
        <br />
        <span>Email: {member.email}</span>
      </div>
      <div className={styles.memberManagementContainer}>
        {/* Dropdown (select) */}
        <Select
          className={styles.roleSelect}
          value={selectedRole}
          isDisabled={!userIsOwner || member.email === user.id}
          onChange={(e) => {
            grantRole(member.email, e.value);
            setSelectedRole(e);
          }}
          options={roleTypes.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
        {userIsOwner && (
          <>
            <div className={styles.memberManagementAction}>
              {userIsOwner && user.id !== member.email && (
                <a href="#">Customize</a>
              )}
            </div>
            <div className={styles.memberManagementAction}>
              {userIsOwner && user.id !== member.email && (
                <a href="#">Remove</a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Members({ roleTypes }) {
  const { members } = useContext(SelectedCapabilityContext);

  return (
    <>
      <Text styledAs="sectionHeadline">Members ({(members || []).length})</Text>
      <div className={styles.members}>
        {(members || []).map((member) => (
          <MemberRow key={member.email} member={member} roleTypes={roleTypes} />
        ))}
      </div>
    </>
  );
}

export function TabbedMembersView({ showInvitations }) {
  const {
    isFetched: fetchedOtherApplications,
    isRefetchting: refetchingOtherApplications,
    data: otherApplicationsData,
  } = useMembershipApplications();
  const { id: capabilityId, availableRoles } = useContext(
    SelectedCapabilityContext,
  );

  const header = <></>;
  const footer = <></>;

  const tabs = {
    members: "Current Members",
    invitations: "Invite Members",
    applications: "Membership Applications",
  };

  const tabsContent = {
    members: <Members roleTypes={availableRoles} />,
    invitations: (
      <>
        {showInvitations ? (
          <CapabilityInvitations />
        ) : (
          <Text>You do not have access to view this information.</Text>
        )}
      </>
    ),
    applications: (
      <MembershipApplicationsUserCanApprove
        data={otherApplicationsData}
        isFetched={fetchedOtherApplications}
        isRefetching={refetchingOtherApplications}
      />
    ),
  };

  return (
    <TabbedPageSection
      headline="Capability Member Management"
      tabs={tabs}
      tabsContent={tabsContent}
      header={header}
      footer={footer}
    />
  );
}
