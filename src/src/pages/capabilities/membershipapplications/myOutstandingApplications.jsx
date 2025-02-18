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

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function MyOutstandingMembershipApplications() {
  const queryClient = useQueryClient();
  const { isFetched, isRefetching, data } =
    useMyOutstandingMembershipApplications();
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
          console.log("Updating removal tracker");
          addApplicationToRemovalTracker(def.id);
        },
      },
    );
    // await selfServiceApiClient.deleteMembershipApplicationApproval(def);
    // addApplicationToRemovalTracker(def.id);
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.capabilityId,
        header: "Capability",
        size: 30,
        enableColumnFilterModes: false,
        enableClickToCopy: true,
        Cell: ({ cell }) => {
          return (
            <div>
              <Text styledAs="action" style={{ marginLeft: "0px" }} as={"div"}>
                {truncateString(cell.getValue(), 70)}
              </Text>
              {/* <div style={{marginTop: "20px"}}></div> */}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => {
          return {
            applicant: row.applicant,
          };
        },
        header: "Applicant",
        size: 50,
        enableColumnFilterModes: false,
        enableClickToCopy: true,
        muiTableHeadCellProps: {
          align: "left",
        },
        muiTableBodyCellProps: {
          align: "left",
        },
        Cell: ({ cell }) => {
          return <div>{cell.getValue().applicant}</div>;
        },
      },
      {
        accessorFn: (row) => row.submittedAt,
        header: "Submitted",
        size: 50,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "left",
        },
        muiTableBodyCellProps: {
          align: "left",
        },
        Cell: ({ cell }) => {
          return <div>{cell.getValue()}</div>;
        },
      },
      {
        accessorFn: (row) => row.expiresOn,
        header: "Expires",
        size: 50,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "left",
        },
        muiTableBodyCellProps: {
          align: "left",
        },
        Cell: ({ cell }) => {
          return <div>{cell.getValue()}</div>;
        },
      },
      {
        accessorFn: (row) => {
          return {
            data: row,
          };
        },
        header: "op",
        size: 50,
        enableColumnFilterModes: false,
        enableSorting: false,
        muiTableHeadCellProps: {
          align: "right",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        Cell: ({ cell }) => {
          return (
            <div>
              {cell.getValue().data.activeCrudOperation ? (
                <div className={styles.buttons}>
                  <Spinner />
                </div>
              ) : (
                <div className={styles.buttons}>
                  <div
                    className={`${styles.button} ${styles.reject}`}
                    onClick={() => {
                      handleDeleteClicked(cell.getValue().data);
                    }}
                  >
                    Delete
                  </div>
                </div>
              )}
            </div>
          );
        },
        Header: <div></div>,
      },
    ],
    [],
  );

  return (
    <>
      {isFetched && tableData.length > 0 ? (
        <PageSection headline="My Outstanding Membership Applications">
          <div className={styles.membershipApplicationsContainer}>
            <MaterialReactTable
              columns={columns}
              data={tableData}
              initialState={{
                pagination: { pageSize: 5 },
                showGlobalFilter: false,
                initialState: { density: "compact" },
              }}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#002b45",
                  padding: "0px 0px 0px 0px",
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: "400",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#4d4e4c",
                  padding: "15px 0px 15px 0px",
                },
              }}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  borderRadius: "0",
                },
              }}
              muiTopToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              enableGlobalFilterModes={true}
              positionGlobalFilter="left"
              muiSearchTextFieldProps={{
                placeholder: `Find a capability...`,
                sx: {
                  minWidth: "1120px",
                  fontWeight: "400",
                  fontSize: "16px",
                  padding: "5px",
                },
                size: "small",
                variant: "outlined",
              }}
              enablePagination={true}
              globalFilterFn="contains"
              enableFilterMatchHighlighting={true}
              enableDensityToggle={true}
              enableHiding={false}
              enableFilters={false}
              enableGlobalFilter={false}
              enableFullScreenToggle={false}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableColumnActions={false}
              muiBottomToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              muiTableBodyRowProps={({ row }) => {
                return {
                  onClick: () => {},
                  sx: {
                    cursor: "pointer",
                    background: "",
                    padding: "0",
                    margin: "0",
                    minHeight: 0,
                    "&:hover td": {
                      backgroundColor:
                        row.original.status === "Deleted"
                          ? "rgba(187, 221, 243, 0.1)"
                          : "rgba(187, 221, 243, 0.4)",
                    },
                  },
                };
              }}
            />
          </div>
        </PageSection>
      ) : (
        <></>
      )}
    </>
  );
}
