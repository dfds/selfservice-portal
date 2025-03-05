import { TabbedPageSection } from "@/components/PageSection";
import { MyOutstandingMembershipApplications } from "../membershipapplications/myOutstandingApplications";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { MyInvitations }  from "@/components/invitations/MyInvitations";

export function TabbedCapabilityMembershipManagement() {
  const header = <></>;
  const footer = <></>;

  const tabs = {
    forApproval: "For approval",
    invitations: "Invitations",
    myApplications: "My outstanding applications",
  };

  const tabsContent = {
    forApproval: <MembershipApplicationsUserCanApprove />,
    invitations: <MyInvitations />,
    myApplications: <MyOutstandingMembershipApplications/>,
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
