import { TabbedPageSection } from "@/components/PageSection";
import { MyOutstandingMembershipApplications } from "../membershipapplications/myOutstandingApplications";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import {
  useMyOutstandingMembershipApplications,
  useMembershipApplications,
} from "@/state/remote/queries/membershipApplications";

const HeaderWithWarning = ({ text, data }) => {
  const count = (data || []).length;
  return (
    <span className="flex items-center gap-1.5">
      {text}
      {count > 0 && (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#be1e2d] px-1 font-mono text-[10px] font-bold leading-none text-white">
          {count}
        </span>
      )}
    </span>
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
    isRefetching: refetchingOtherApplications,
    data: otherApplicationsData,
  } = useMembershipApplications();

  const header = <></>;
  const footer = <></>;

  const tabs = {
    forApproval: (
      <HeaderWithWarning
        text="Applications For Approval"
        data={otherApplicationsData}
      />
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
