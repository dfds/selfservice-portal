import React, { useContext, useEffect, useMemo, useState } from "react";
import { Text } from "@dfds-ui/typography";
import {
  Button,
  Spinner,
} from "@dfds-ui/react-components";
import PageSection from "components/PageSection";
import { useSelfServiceRequest } from "../../hooks/SelfServiceApi";
import { MaterialReactTable } from "material-react-table";

export default function MyInvitations({ invitationType }) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const { responseData: acceptResponse, sendRequest: acceptRequest } = useSelfServiceRequest();
  const { responseData: declineResponse, sendRequest: declineRequest } = useSelfServiceRequest();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInvitations = () => { sendRequest({ urlSegments: [`invitations?targetType=${invitationType}`] }); };

  useEffect(() => {
    setIsLoading(true);
    loadInvitations();
  }, [acceptResponse, declineResponse]);

  useEffect(() => {
    const invitations = responseData?.items || [];
    setInvitations(invitations);
    setIsLoading(false);
  }, [responseData]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => {
          return {
            description: row.description,
          };
        },
        header: "Description",
        size: 350,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => {
          return (
            <Text styledAs="action" style={{ marginLeft: "20px" }} as={"div"}>
              {cell.getValue().description}
            </Text>
          );
        },
      },
      {
        accessorFn: (row) => {
          return {
            accept: row._links.accept,
            decline: row._links.decline,
          };
        },
        header: "Actions",
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          return (
            <>
              <Button
                onClick={() => {declineRequest({urlSegments: [cell.getValue().decline.href], method: 'POST'})}}
                size="small"
                variation="link"
                style={{ color: "#ed8800" }}
              >
                Decline
              </Button>
              <span style={{ marginLeft: "10px", marginRight: "10px" }} />
              <Button
                onClick={() => {acceptRequest({urlSegments: [cell.getValue().accept.href], method: 'POST'})}}
                size="small"
                variation="primary"
              >
                Accept
              </Button>
            </>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
    {isLoading && <Spinner />}

    {!isLoading && invitations.length > 0 && (
      <PageSection
        headline={`My Invitations ${isLoading ? "" : `(${invitations.length})`}`}
      >
          <MaterialReactTable
          columns={columns}
          data={invitations}
          initialState={{pagination: {pageSize: 5}, showGlobalFilter: true}}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: "700",
              fontSize: "16px",
              fontFamily: "DFDS",
              color: "#002b45",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontWeight: "400",
              fontSize: "16px",
              fontFamily: "DFDS",
              color: "#4d4e4c",
              padding: "5px",
            },
          }}
          muiTablePaperProps={{
            elevation: 0, //change the mui box shadow
            //customize paper styles
            sx: {
              borderRadius: "0",
            },
          }}
          muiTopToolbarProps={{
            sx: {
              background: 'none',
            }
          }}
          enableGlobalFilterModes={true}
          positionGlobalFilter="left"
          muiSearchTextFieldProps={{
            placeholder: `Find a capability...`,
            sx: {
              minWidth: '1120px',
              fontWeight: '400',
              fontSize: '16px',
              padding: '5px',
            },
            size: 'small',
            variant: 'outlined',
          }}
          enablePagination={true}
          globalFilterFn="contains"
          enableDensityToggle={false}
          enableHiding={false}
          enableFilters={false}
          enableGlobalFilter={false}
          enableTopToolbar={false}
          enableBottomToolbar={true}
          enableColumnActions={false}
          muiBottomToolbarProps={{
            sx: {
              background: "none",
            },
          }}
          />
      </PageSection>
    )}
    </>
  );
}
