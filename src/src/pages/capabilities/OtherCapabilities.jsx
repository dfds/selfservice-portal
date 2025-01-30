import React, { useContext, useEffect, useState, useMemo } from "react";
import { Text } from "@/components/dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "@dfds-ui/icons/system";
import { Spinner } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { useMe } from "@/state/remote/queries/me";
import PreAppContext from "../../preAppContext";
import { useCapabilities } from "@/state/remote/queries/capabilities";

import { MaterialReactTable } from "material-react-table";

export default function OtherCapabilities() {
  const { truncateString } = useContext(AppContext);
  const { isFetched: isMeFetched, data: meData } = useMe();
  const { isFetched, data: capabilities } = useCapabilities();

  const [otherCapabilities, setOtherCapabilities] = useState([]);

  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    if (isFetched) {
      /*const filteredList = capabilities.filter((x) => {
        const myCap = meData.capabilities.find((y) => y.id === x.id);
        if (myCap) {
          return false;
        } else {
          return true;
        }
      });

      setOtherCapabilities(filteredList);
      */
      setOtherCapabilities(capabilities);
    }
  }, [capabilities, meData, isFetched]);

  useEffect(() => {
    setSearchResult(otherCapabilities);
  }, [otherCapabilities]);

  const items = searchResult;
  const isLoading = !isFetched;

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        header: "Name",
        size: 350,
        enableColumnFilterModes: true,
        disableFilters: false,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,

        Cell: ({ cell, renderedCellValue }) => {
          return (
            <div>
              {" "}
              <Text styledAs="action" as={"div"}>
                {truncateString(renderedCellValue, 70)}
              </Text>
              <Text styledAs="caption" as={"div"}>
                {truncateString(cell.row.original.description, 70)}
              </Text>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.jsonMetadata,
        header: "Cost Centre",
        size: 50,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          const jsonMetadata = JSON.parse(cell.getValue() ?? "{}");
          if (jsonMetadata["dfds.cost.centre"] === undefined) {
            return <div></div>;
          }
          return <div>{jsonMetadata["dfds.cost.centre"]}</div>;
        },
      },
      {
        accessorFn: (row) => row.awsAccountId,
        header: "AwsAccountId",
        enableColumnFilterModes: false,
        disableFilters: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          return <div>{cell.getValue()}</div>;
        },
      },
      {
        accessorFn: (row) => row.id,
        header: "arrow",
        size: 1,
        enableColumnFilterModes: false,
        muiTableBodyCellProps: {
          align: "right",
        },
        Cell: ({ cell }) => {
          return <ChevronRight />;
        },
        Header: <div></div>, //enable empty header
      },
    ],
    [],
  );

  return (
    <>
      <PageSection
        headline={`All Capabilities ${isLoading ? "" : `(${items.length})`}`}
      >
        {isLoading && <Spinner />}

        {!isLoading && (
          <>
            <MaterialReactTable
              columns={columns}
              data={otherCapabilities}
              initialState={{
                pagination: { pageSize: 50 },
                showGlobalFilter: true,
                columnVisibility: { AwsAccountId: false },
              }}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#002b45",
                },
              }}
              filterFns={{
                customFilterFn: (row, id, filterValue) => {
                  console.log(row.getValue(id));
                  console.log(row);
                  return true;
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
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter={true}
              enableTopToolbar={true}
              enableBottomToolbar={true}
              enableColumnActions={false}
              muiTopToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              muiBottomToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              muiTableBodyRowProps={({ row }) => {
                return {
                  onClick: () => {
                    clickHandler(row.original.id);
                  },
                  sx: {
                    cursor: "pointer",
                    background: row.original.status === "Deleted" ? "#d88" : "",
                    padding: 0,
                    margin: 0,
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
          </>
        )}
      </PageSection>
    </>
  );
}
