import React, { useContext } from "react";
import styles from "./members.module.css";
import { Text } from "@/components/dfds-ui/typography";
import ProfilePicture from "./profilepicture";
import { TabbedPageSection } from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import MembershipApplications from "../membershipapplications";
import { CapabilityInvitations } from "../capabilityInvitations/capabilityInvitations";

export default function Members() {
  const { members } = useContext(SelectedCapabilityContext);

  return (
    <>
      <Text styledAs="sectionHeadline">Members ({(members || []).length})</Text>
      <div className={styles.members}>
        {(members || []).map((member) => (
          <ProfilePicture
            key={member.email}
            name={member.name ?? member.email}
            pictureUrl={member.pictureUrl}
          />
        ))}
      </div>
    </>
  );
}

export function TabbedMembersView({ showInvitations }) {
  const header = <></>;
  const footer = <></>;

  const tabs = {
    members: "Current Members",
    invitations: "Invite Members",
    applications: "Membership Applications",
  };

  const tabsContent = {
    members: <Members />,
    invitations: (
      <>
        {showInvitations ? (
          <CapabilityInvitations />
        ) : (
          <Text>You do not have access to view this information.</Text>
        )}
      </>
    ),
    applications: <MembershipApplications />,
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
