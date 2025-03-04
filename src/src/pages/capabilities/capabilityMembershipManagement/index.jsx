import { TabbedPageSection } from "@/components/PageSection";
import { MyOutstandingMembershipApplications } from "../membershipapplications/myOutstandingApplications";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
//import { MyInvitations } from "@/components/invitations/MyInvitations";

export function TabbedCapabilityMembershipManagement() {
  const header = <></>;
  const footer = <></>;

  const tabs = {
    adoption: "My outstanding applications",
    assessments: "For approval",
    //invitations: "Invitations",
  };

  const tabsContent = {
    myApplications: <MyOutstandingMembershipApplications />,
    forApproval: <MembershipApplicationsUserCanApprove />,
    //invitations: <MyInvitations />,
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
