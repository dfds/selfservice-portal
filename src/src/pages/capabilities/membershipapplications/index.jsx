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
  Button,
  Spinner,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@dfds-ui/react-components";
import { Text } from "@dfds-ui/typography";
import { useQueryClient } from "@tanstack/react-query";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { differenceInCalendarDays, format, intlFormatDistance } from "date-fns";
import { MaterialReactTable } from "material-react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import PreAppContext from "../../../preAppContext";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import styles from "./index.module.css";
import ProfilePicture from "./ProfilePicture";

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

export default function MembershipApplications() {
  const {
    membershipApplications,
    approveMembershipApplication,
    deleteMembershipApplication,
  } = useContext(SelectedCapabilityContext);
  const { myProfile, checkIfCloudEngineer, user } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [isCloudEngineer, setIsCloudEngineer] = useState(false);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);

  useEffect(() => {
    if (user && user.isAuthenticated) {
      setIsCloudEngineer(checkIfCloudEngineer(user.roles));
    }
  }, [user]);

  useEffect(() => {
    const list = (membershipApplications || [])
      .filter((x) => x.applicant !== myProfile?.id)
      .map((x) => {
        const copy = { ...x };

        copy.canApprove = false;
        copy.showApprove = true;
        copy.isApproving = false;

        const approvalLink = copy?.approvals?._links?.self;
        if (approvalLink) {
          copy.canApprove = (approvalLink.allow || []).includes("POST");
          copy.showApprove = (approvalLink.allow || []).includes("GET");
        }

        return copy;
      });

    setApplications(list);
  }, [membershipApplications, myProfile]);

  const handleApproveClicked = useCallback(
    (membershipApplicationId) => {
      setApplications((prev) => {
        const copy = [...prev];
        const found = copy.find((x) => x.id === membershipApplicationId);

        if (found) {
          found.isApproving = true;
        }

        return copy;
      });
      approveMembershipApplication(membershipApplicationId);
    },
    [membershipApplications],
  );

  const handleDeleteClicked = useCallback(
    (membershipApplicationId) => {
      setApplications((prev) => {
        const copy = [...prev];
        const found = copy.find((x) => x.id === membershipApplicationId);

        if (found) {
          found.isApproving = true;
        }

        return copy;
      });
      deleteMembershipApplication(membershipApplicationId);
    },
    [membershipApplications],
  );

  const hasPendingApplications = applications.length > 0;
  if (!hasPendingApplications) {
    return null;
  }

  return (
    <>
      <PageSection headline="Membership Applications">
        <Table isInteractive width={"100%"}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>&nbsp;</TableHeaderCell>
              <TableHeaderCell>Applicant</TableHeaderCell>
              <TableHeaderCell>Application date</TableHeaderCell>
              <TableHeaderCell>Expires</TableHeaderCell>
              <TableHeaderCell>&nbsp;</TableHeaderCell>
              <TableHeaderCell>&nbsp;</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((x) => (
              <TableRow key={x.applicant}>
                <TableDataCell>
                  <ProfilePicture
                    name={x.applicant}
                    pictureUrl={x.applicantProfilePictureUrl}
                  />
                </TableDataCell>
                <TableDataCell>{x.applicant}</TableDataCell>
                <TableDataCell>
                  {format(new Date(x.submittedAt), "MMMM do yyyy")}
                </TableDataCell>
                <TableDataCell>
                  <ExpirationDate date={x.expiresOn} />
                </TableDataCell>
                <TableDataCell align="right">
                  {x.showApprove && (
                    <Button
                      size="small"
                      disabled={!x.canApprove}
                      submitting={x.isApproving}
                      title={
                        x.canApprove
                          ? "Submit your approval of this membership"
                          : "You have already submitted your approval for this membership. Waiting for other members to approve."
                      }
                      onClick={() => handleApproveClicked(x.id)}
                    >
                      Approve
                    </Button>
                  )}
                </TableDataCell>
                {isCloudEngineer && isCloudEngineerEnabled ? (
                  <TableDataCell style={{ minWidth: "6rem" }}>
                    <Button
                      variation="danger"
                      title="Deny this application for membership"
                      onClick={() => handleDeleteClicked(x.id)}
                    >
                      Delete
                    </Button>
                  </TableDataCell>
                ) : (
                  <TableDataCell>&nbsp;</TableDataCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
    </>
  );
}

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

export function MembershipApplicationsUserCanApprove() {
  const queryClient = useQueryClient();
  const { isFetched, isRefetching, data } = useMembershipApplications();
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
          console.log("Updating removal tracker");
          addApplicationToRemovalTracker(def.id);
        },
      },
    );
    // await selfServiceApiClient.submitMembershipApplicationApproval(def);
    // addApplicationToRemovalTracker(def.id);
  };

  const handleRejectClicked = async (def) => {
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
                    className={styles.button}
                    onClick={() => {
                      handleApproveClicked(cell.getValue().data);
                    }}
                  >
                    Approve
                  </div>

                  <div
                    className={`${styles.button} ${styles.reject}`}
                    onClick={() => {
                      handleRejectClicked(cell.getValue().data);
                    }}
                  >
                    Reject
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
        <PageSection headline="Pending approval">
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
