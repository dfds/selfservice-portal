import React, { useEffect, useMemo, useState, useContext } from "react";
import { Text } from "@/components/dfds-ui/typography";
import { Button, Spinner } from "@/components/dfds-ui/react-components";
import PageSection from "components/PageSection";
import { MaterialReactTable } from "material-react-table";
import {
  useCapabilitiesAcceptInvitation,
  useCapabilitiesMyInvitations,
  useCapabilitiesDeclineInvitation,
} from "@/state/remote/queries/capabilities";
import { useQueryClient } from "@tanstack/react-query";
import PreAppContext from "@/preAppContext";

export default function MyInvitations({ invitationsLink }) {
  const queryClient = useQueryClient();
  const { isFetched, data: responseData } =
    useCapabilitiesMyInvitations(invitationsLink);
  const capabilitiesAcceptInvitation = useCapabilitiesAcceptInvitation();
  const capabilitiesDeclineInvitation = useCapabilitiesDeclineInvitation();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const invitations = responseData?.items || [];
    setInvitations(invitations);
    setIsLoading(false);
  }, [isFetched, responseData]);

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
                onClick={() => {
                  capabilitiesDeclineInvitation.mutate(
                    {
                      link: cell.getValue().decline.href,
                    },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["capabilities", "invitations"],
                        });
                      },
                    },
                  );
                }}
                size="small"
                variation="danger"
              >
                Decline
              </Button>
              <span style={{ marginLeft: "10px", marginRight: "10px" }} />
              <Button
                onClick={() => {
                  capabilitiesAcceptInvitation.mutate(
                    {
                      link: cell.getValue().accept.href,
                    },
                    {
                      onSuccess: async () => {
                        queryClient.invalidateQueries({
                          queryKey: ["capabilities"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["me"],
                        });
                      },
                    },
                  );
                }}
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
          headline={`My Invitations ${
            isLoading ? "" : `(${invitations.length})`
          }`}
        >
          <MaterialReactTable
            columns={columns}
            data={invitations}
            initialState={{
              pagination: { pageSize: 5 },
              showGlobalFilter: true,
            }}
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
                background: "none",
              },
            }}
            enableGlobalFilterModes={false}
            enablePagination={true}
            globalFilterFn="contains"
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
