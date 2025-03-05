
  import { Spinner } from "@dfds-ui/react-components";
  import { Text } from "@dfds-ui/typography";
  import { MaterialReactTable } from "material-react-table";
  import { useMemo, useContext } from "react";
  import styles from "./index.module.css";
  import AppContext from "@/AppContext";

  export function MembershipApplicationTable({
    tableData,
    handleApproveClicked,
    approveButtonLabel,
    handleRejectClicked,
    rejectButtonLabel
  }) {
    const { truncateString } = useContext(AppContext);
  
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
                            {handleApproveClicked != null && <div
                                className={styles.button}
                                onClick={() => {
                                  handleApproveClicked(cell.getValue().data);
                                }}
                              >
                                {approveButtonLabel != null ? approveButtonLabel : "Approve"}
                              </div>
                            }
                            <div
                              className={`${styles.button} ${styles.reject}`}
                              onClick={() => {
                                handleRejectClicked(cell.getValue().data);
                              }}
                            >
                              {rejectButtonLabel != null ? rejectButtonLabel : "Reject"}
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
      </>
    );
  }
  
  