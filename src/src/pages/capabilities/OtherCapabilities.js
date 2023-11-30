import React, { useContext, useEffect, useState, useMemo } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "@dfds-ui/icons/system";
import { Spinner } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { useCapabilities } from "hooks/Capabilities";
import { MaterialReactTable } from "material-react-table";

export default function OtherCapabilities() {
  const { myCapabilities, appStatus } = useContext(AppContext);
  const { capabilities, isLoaded } = useCapabilities();
  const [otherCapabilities, setOtherCapabilities] = useState([]);

  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    if (!appStatus.hasLoadedMyCapabilities) {
      return;
    }

    const filteredList = capabilities.filter((x) => {
      const myCap = myCapabilities.find((y) => y.id === x.id);
      if (myCap) {
        return false;
      } else {
        return true;
      }
    });

    setOtherCapabilities(filteredList);
  }, [capabilities, myCapabilities, appStatus]);

  useEffect(() => {
    setSearchResult(otherCapabilities);
  }, [otherCapabilities]);

  const items = searchResult;
  const isLoading = !isLoaded;

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
                {renderedCellValue}
              </Text>
              <Text styledAs="caption" as={"div"}>
                {cell.row.original.description}
              </Text>
            </div>
          );
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
        headline={`Other Capabilities ${isLoading ? "" : `(${items.length})`}`}
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
              muiTableBodyRowProps2={({ row }) => ({
                onClick: () => {
                  clickHandler(row.original.id);
                },
                sx: {
                  cursor: "pointer",
                  background: row.original.status === "Delete" ? "#d88" : "",
                  padding: 0,
                  margin: 0,
                  minHeight: 0,
                },
              })}
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
