import { TabbedPageSection } from "@/components/PageSection";
import { useContext } from "react";
import { MyOutstandingMembershipApplications } from "../membershipapplications/myOutstandingApplications";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { MyInvitations }  from "@/components/invitations/MyInvitations";
import { Text } from "@dfds-ui/typography";
import {
  useMyOutstandingMembershipApplications,
  useMembershipApplications,
} from "@/state/remote/queries/membershipApplications";
import { useCapabilitiesMyInvitations } from "@/state/remote/queries/capabilities";
import { StatusAlert } from "@dfds-ui/icons/system";
import styles from "./capabilityMembershipManagement.module.css";
import AppContext from "@/AppContext";

export function TabbedCapabilityMembershipManagement() {
  const { myProfile } = useContext(AppContext);
  const { isFetched: fetchedMyInvitations, data: myInvitationsData } =
    useCapabilitiesMyInvitations(myProfile?._links?.invitationsLinks?.capabilityInvitations?.href);
  const { isFetched: fetchedMyApplications, isRefetching: refetchingMyApplications, data: myApplicationsData } = useMyOutstandingMembershipApplications();
  const { isFetched: fetchedOtherApplications, isRefetchting: refetchingOtherApplications, data: otherApplicationsData } = useMembershipApplications();

  const header = <></>;
  const footer = <></>;

  const tabs = {
    forApproval:
      <>
        <Text styledAs="action" as={"div"}>
          {(otherApplicationsData || []).length > 0 && <StatusAlert className={styles.attentionIcon} />}
          For approval {(otherApplicationsData || []).length > 0 && `(${(otherApplicationsData || []).length})`}
        </Text>
      </>,
    invitations:
      <>
        <Text styledAs="action" as={"div"}>
          {(myInvitationsData?.items || []).length > 0 && <StatusAlert className={styles.attentionIcon} />}
          My invitations {(myInvitationsData?.items || []).length > 0 && `(${(myInvitationsData?.items || []).length})`}
        </Text>
      </>,
    myApplications:
      <>
        <Text styledAs="action" as={"div"}>
          {(myApplicationsData || []).length > 0 && <StatusAlert className={styles.attentionIcon} />}
          My outstanding applications ({(myApplicationsData || []).length})
        </Text>
      </>,
  };

  const tabsContent = {
    forApproval: <MembershipApplicationsUserCanApprove data={otherApplicationsData} isFetched={fetchedOtherApplications} isRefetching={refetchingOtherApplications} />,
    invitations: <MyInvitations items={myInvitationsData?.items || []} isFetched={fetchedMyInvitations} />,
    myApplications: <MyOutstandingMembershipApplications data={myApplicationsData} isFetched={fetchedMyApplications} isRefetching={refetchingMyApplications} />,
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
