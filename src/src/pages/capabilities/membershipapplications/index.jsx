import {
  useDeleteMembershipApplicationApproval,
  useMembershipApplications,
  useSubmitMembershipApplicationApproval,
} from "@/state/remote/queries/membershipApplications";
import { useToast } from "@/context/ToastContext";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkeletonMembershipApplicationRow } from "@/components/ui/skeleton";
import { useGetRoles } from "@/state/remote/queries/rbac";
import { useQueryClient } from "@tanstack/react-query";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { differenceInCalendarDays, format, intlFormatDistance } from "date-fns";
import { useContext, useEffect, useState } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import { MembershipApplicationTable } from "./membershipApplicationTable";
import { sleep } from "../../../Utils";

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
      <div className="flex gap-3 items-start rounded-md border border-[#c8e6c9] dark:border-green-800 bg-[#e8f5e9] dark:bg-green-950 p-4">
        <CheckCircle
          className="mt-0.5 shrink-0 text-[#388e3c] dark:text-green-400"
          size={20}
        />
        <div>
          <p className="font-semibold text-[#1b5e20] dark:text-green-300">
            Membership Application Received
          </p>
          <p className="text-sm text-[#2e7d32] dark:text-green-300">
            Your request to join this capability has been received and it&apos;s
            waiting approval from existing members.
            <br />
            <br />
            <strong>Please note:</strong> this application expires{" "}
            <ExpirationDate date={application.expiresOn} />!
          </p>
        </div>
      </div>
    </div>
  );
}

function ExpirationDate({ date }) {
  const daysUntil = differenceInCalendarDays(new Date(date), new Date());
  const label = intlFormatDistance(new Date(date), new Date());

  return daysUntil < 3 ? (
    <Badge variant="destructive">{label}</Badge>
  ) : (
    <span>{label}</span>
  );
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
  const toast = useToast();
  const { truncateString } = useContext(AppContext);
  const [tableData, setTableData] = useState([]);
  const [removalTracker, setRemovalTracker] = useState(new Set());
  const { data: availableRolesData } = useGetRoles(null);
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

  const handleApproveClicked = (def, roleId) => {
    setActiveCrudOpOnTableDataItem(def);
    submitMembershipApplicationApproval.mutate(
      {
        membershipApplicationDefinition: def,
        roleId,
      },
      {
        onSuccess: () => {
          addApplicationToRemovalTracker(def.id);
          sleep(2000).then(() => {
            queryClient.invalidateQueries({
              queryKey: ["membershipapplications/eligible-for-approval"],
            });
            queryClient.invalidateQueries({
              queryKey: ["membershipapplications/my-outstanding-applications"],
            });
            queryClient.invalidateQueries({
              queryKey: ["capabilities", "members"],
            });
          });
          toast.success("Access granted. Welcome to the team");
        },
        onError: () => toast.error("Could not approve membership"),
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
          sleep(2000).then(() => {
            queryClient.invalidateQueries({
              queryKey: ["membershipapplications/eligible-for-approval"],
            });
            queryClient.invalidateQueries({
              queryKey: ["membershipapplications/my-outstanding-applications"],
            });
          });
          toast.success("Application declined");
        },
        onError: () => toast.error("Could not decline membership"),
      },
    );
  };

  if (!isFetched) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <SkeletonMembershipApplicationRow key={i} isLast={i === 2} />
        ))}
      </div>
    );
  }

  const roleOptions = (availableRolesData || []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <>
      {tableData.length > 0 ? (
        <MembershipApplicationTable
          tableData={tableData}
          roleOptions={roleOptions}
          handleApproveClicked={handleApproveClicked}
          handleRejectClicked={handleRejectClicked}
        />
      ) : (
        <p className="text-[13px] text-[#afafaf] dark:text-slate-500">
          No pending membership applications
        </p>
      )}
    </>
  );
}
