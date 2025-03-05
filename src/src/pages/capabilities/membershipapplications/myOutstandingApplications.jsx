import {
  useDeleteMembershipApplicationApproval,
  useMyOutstandingMembershipApplications,
  useSubmitMembershipApplicationApproval,
} from "@/state/remote/queries/membershipApplications";
import { Spinner } from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { useQueryClient } from "@tanstack/react-query";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { MaterialReactTable } from "material-react-table";
import { useContext, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import styles from "./index.module.css";
import { MembershipApplicationTable } from "./membershipApplicationTable";

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function MyOutstandingMembershipApplicationsPageSection() {
  return (
    <PageSection headline="My Outstanding Membership Applications">
      <MyOutstandingMembershipApplications />
    </PageSection>
  )
}

export function MyOutstandingMembershipApplications() {
  const queryClient = useQueryClient();
  const { isFetched, isRefetching, data } =
    useMyOutstandingMembershipApplications();
  const [tableData, setTableData] = useState([]);
  const [removalTracker, setRemovalTracker] = useState(new Set());
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
            queryKey: ["membershipapplications/my-outstanding-applications"],
          });
        });
      }
    }
  }, [data, isRefetching]);

  const addApplicationToRemovalTracker = (id) => {
    setRemovalTracker((prev) => {
      prev.add(id);
      queryClient.invalidateQueries({
        queryKey: ["membershipapplications/my-outstanding-applications"],
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

  const handleDeleteClicked = async (def) => {
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
        <MembershipApplicationTable tableData={tableData} handleDeleteClicked={handleDeleteClicked} />
      ) : (
        <>No memberships</>
      )}
    </>
  );
}

