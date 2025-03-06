import {
  useDeleteMembershipApplicationApproval,
  useMembershipApplications,
  useSubmitMembershipApplicationApproval,
} from "@/state/remote/queries/membershipApplications";
import { StatusSuccess } from "@dfds-ui/icons/system";
import {
  Badge,
  Banner,
  BannerHeadline,
  BannerParagraph,
} from "@dfds-ui/react-components";
import { useQueryClient } from "@tanstack/react-query";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { differenceInCalendarDays, format, intlFormatDistance } from "date-fns";
import {  useContext, useEffect, useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { MembershipApplicationTable } from "./membershipApplicationTable";

export function MyMembershipApplication() {
  const { membershipApplications } = useContext(SelectedCapabilityContext);
  const { myProfile } = useContext(AppContext);

  const application = (membershipApplications || []).find(
    (x) => x.applicant === myProfile?.id,
  );
  if (!application) {
    return null;
  }

  return (
    <div>
      <Banner variant={"lowEmphasis"} icon={StatusSuccess}>
        <BannerHeadline>Membership Application Received</BannerHeadline>
        <BannerParagraph>
          Your request to join this capability has been received and it's
          waiting approval from existing members.
          <br />
          <br />
          <strong>Please note:</strong> that it expire{" "}
          <ExpirationDate date={application.expiresOn} />!
        </BannerParagraph>
      </Banner>
    </div>
  );
}

function ExpirationDate({ date }) {
  const daysUntil = differenceInCalendarDays(new Date(date), new Date());
  const label = intlFormatDistance(new Date(date), new Date());

  return daysUntil < 3 ? (
    <Badge intent="critical">{label}</Badge>
  ) : (
    <span>{label}</span>
  );
}

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function MembershipApplicationsUserCanApprovePageSection() {
  return (
    <PageSection headline="Pending approval">
      <MembershipApplicationsUserCanApprove />
    </PageSection>
  );
} 

export function MembershipApplicationsUserCanApprove({
  data,
  isFetched,
  isRefetching,
}) {
  const queryClient = useQueryClient();
  const { truncateString } = useContext(AppContext);
  const [tableData, setTableData] = useState([]);
  const [removalTracker, setRemovalTracker] = useState(new Set());
  const submitMembershipApplicationApproval =
    useSubmitMembershipApplicationApproval();
  const deleteMembershipApplicationApproval =
    useDeleteMembershipApplicationApproval();

  useEffect(() => {
    if (data) {
      const tableData = data.map((item) => {
        const copy = { ...item };

        copy.submittedAt = format(new Date(copy.submittedAt), "MMMM do yyyy");
        copy.expiresOn = format(new Date(copy.expiresOn), "MMMM do yyyy");
        copy.activeCrudOperation = false;
        if (removalTracker.has(copy.id)) {
          copy.activeCrudOperation = true;
        }

        return copy;
      });
      setTableData(tableData);

      let triggerUpdate = false;
      removalTracker.forEach((id) => {
        if (tableData.find((x) => x.id === id) === undefined) {
          setRemovalTracker((prev) => {
            prev.delete(id);
            return prev;
          });
        } else {
          triggerUpdate = true;
        }
      });

      if (triggerUpdate) {
        sleep(1400).then(() => {
          queryClient.invalidateQueries({
            queryKey: ["membershipapplications/eligible-for-approval"],
          });
        });
      }
    }
  }, [data, isRefetching]);

  const addApplicationToRemovalTracker = (id) => {
    setRemovalTracker((prev) => {
      prev.add(id);
      queryClient.invalidateQueries({
        queryKey: ["membershipapplications/eligible-for-approval"],
      });
      return prev;
    });
  };

  const setActiveCrudOpOnTableDataItem = (membershipApplication) => {
    setTableData((prev) => {
      const data = prev.map((item) => {
        if (item.id === membershipApplication.id) {
          item.activeCrudOperation = true;
        }
        return item;
      });

      return data;
    });
  };

  const handleApproveClicked = async (def) => {
    setActiveCrudOpOnTableDataItem(def);
    submitMembershipApplicationApproval.mutate(
      {
        membershipApplicationDefinition: def,
      },
      {
        onSuccess: () => {
          addApplicationToRemovalTracker(def.id);
        },
      },
    );
  };

  const handleRejectClicked = async (def) => {
    setActiveCrudOpOnTableDataItem(def);
    deleteMembershipApplicationApproval.mutate(
      {
        membershipApplicationDefinition: def,
      },
      {
        onSuccess: () => {
          addApplicationToRemovalTracker(def.id);
        },
      },
    );
  };


  return (
    <>
      {isFetched && tableData.length > 0 ? (
        <MembershipApplicationTable
          tableData={tableData}
          handleApproveClicked={handleApproveClicked}
          handleRejectClicked={handleRejectClicked} />
      ) : (
        <>You have no membership applications to consider</>
      )}
    </>
  );
}
