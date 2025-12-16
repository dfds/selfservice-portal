import { TabbedPageSection } from "@/components/PageSection";
import { useContext, useEffect } from "react";
import { MyOutstandingMembershipApplications } from "../membershipapplications/myOutstandingApplications";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { Text } from "@dfds-ui/typography";
import {
  useMyOutstandingMembershipApplications,
  useMembershipApplications,
} from "@/state/remote/queries/membershipApplications";
import { StatusAlert } from "@dfds-ui/icons/system";
import styles from "./capabilityMembershipManagement.module.css";

const HeaderWithWarning = ({ text, data }) => {
  return (
    <>
      <Text styledAs="action" as={"div"}>
        {(data || []).length > 0 && (
          <StatusAlert className={styles.attentionIcon} />
        )}
        {text} {(data || []).length > 0 && `(${(data || []).length})`}
      </Text>
    </>
  );
};

export function TabbedCapabilityMembershipManagement() {
  const {
    isFetched: fetchedMyApplications,
    isRefetching: refetchingMyApplications,
    data: myApplicationsData,
  } = useMyOutstandingMembershipApplications();
  const {
    isFetched: fetchedOtherApplications,
    isRefetchting: refetchingOtherApplications,
    data: otherApplicationsData,
  } = useMembershipApplications();

  const header = <></>;
  const footer = <></>;

  const tabs = {
    forApproval: (
      <HeaderWithWarning text="Applications For Approval" data={otherApplicationsData} />
    ),
    myApplications: (
      <HeaderWithWarning text="Your Applications" data={myApplicationsData} />
    ),
  };

  const tabsContent = {
    forApproval: (
      <MembershipApplicationsUserCanApprove
        data={otherApplicationsData}
        isFetched={fetchedOtherApplications}
        isRefetching={refetchingOtherApplications}
      />
    ),
    myApplications: (
      <MyOutstandingMembershipApplications
        data={myApplicationsData}
        isFetched={fetchedMyApplications}
        isRefetching={refetchingMyApplications}
      />
    ),
  };

  return (
    <TabbedPageSection
      headline="Membership Management"
      tabs={tabs}
      tabsContent={tabsContent}
      header={header}
      footer={footer}
    />
  );
}
