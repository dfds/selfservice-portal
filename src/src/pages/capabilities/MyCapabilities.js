import React, { useContext, useEffect, useMemo, useState } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight, StatusAlert } from "@dfds-ui/icons/system";
import {
  Spinner,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import CapabilityCostSummary from "components/BasicCapabilityCost";
import styles from "./capabilities.module.css"
import mystyles from "./myCapabilities.module.css";
import { MaterialReactTable } from 'material-react-table';
import { InlineAwsCountSummary } from "pages/capabilities/AwsResourceCount";


export default function MyCapabilities() {
  const { myCapabilities, metricsWrapper, appStatus, truncateString } = useContext(AppContext);

  const items = myCapabilities || [];
  const isLoading = !appStatus.hasLoadedMyCapabilities;
  const isLoadingCosts = !appStatus.hasLoadedMyCapabilitiesCosts;
  const isLoadingAwsResourcesCounts = !appStatus.hasLoadedMyCapabilitiesResourcesCounts;
  const [showCostsSpinner, setShowCostsSpinner] = useState(isLoadingCosts);
  const [showAwsResourcesSpinner, setShowAwsResourcesSpinner] = useState(isLoadingAwsResourcesCounts);
  const [fullTableData, setFullTableData] = useState([]);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    let isMounted = true;

    // after 3 seconds, hide the spinner regardless if costs have been loaded or not
    const timeout = setTimeout(() => {
      if (isMounted) {
        setShowCostsSpinner(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setShowCostsSpinner(isLoadingCosts);
  }, [isLoadingCosts]);

  useEffect(() => {
    let isMounted = true;

    // after 3 seconds, hide the spinner regardless if costs have been loaded or not
    const timeout = setTimeout(() => {
      if (isMounted) {
        setShowAwsResourcesSpinner(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setShowAwsResourcesSpinner(isLoadingAwsResourcesCounts);
  }, [isLoadingAwsResourcesCounts]);

  const rowClass = (status) => status === "Deleted" ? styles.deletedRow : '';


  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => { return { name: row.name, description: row.description } },
        header: 'Name',
        size: 350,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => {
          return <div> <Text styledAs="action" as={"div"}>
            {cell.getValue().name}
          </Text>
            <Text styledAs="caption" as={"div"}>
              {cell.getValue().description}
            </Text></div>
        }

      },
      {
        accessorKey: 'id',
        header: 'Aws Resources',
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
        Cell: ({ cell }) => {
          return <div style={{
          }}>
            <InlineAwsCountSummary data={
              metricsWrapper.getAwsResourcesTotalCountForCapability(cell.getValue().toLocaleString())
            } />
          </div>
        }


      },
      {
        accessorKey: 'id',
        header: 'Costs',
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: 'center'
        },
        muiTableBodyCellProps: {
          align: 'right'
        },
        Cell: ({ cell }) => {
          return <div className={styles.costs}>
            <CapabilityCostSummary
              data={metricsWrapper.getCostsForCapability(
                cell.getValue().toLocaleString(),
                7,
              )}
            />
          </div>
        }
      },
      {
        id: 'details',
        size: 1,
        enableColumnFilterModes: false,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => {
          return <ChevronRight />
        }
      },
    ],
    [],
  )

  useEffect(() => {

    const tableData = items.map((item) => {

      const copy = { ...item };

      return copy;

    });



    setFullTableData(tableData);

  }, [isLoading, appStatus])


  return (
    <>
      <PageSection
        headline={`My Capabilities ${isLoading ? "" : `(${items.length})`}`}
      >
        {isLoading && <Spinner />}

        {!isLoading && items.length === 0 && (
          <Text>
            Oh no! You have not joined a capability...yet! Knock yourself out
            with the ones below...
          </Text>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <MaterialReactTable columns={columns} data={fullTableData}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: '700',
                  fontSize: '16px',
                  fontFamily: 'DFDS',
                  color: '#002b45',
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: '400',
                  fontSize: '16px',
                  fontFamily: 'DFDS',
                  color: '#4d4e4c',
                  padding: '5px',
                  // margin: 0,
                  // minHeight: 0,
                },
              }}
              muiTablePaperProps={{
                elevation: 0, //change the mui box shadow
                //customize paper styles
                sx: {
                  borderRadius: '0',
                }
              }
              }
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableColumnActions={false}
              muiTableBodyRowProps={({ row }) => ({
                onClick: () => {
                  console.log('status', row.original.status);
                  clickHandler(row.original.id)
                },
                sx: {
                  cursor: 'pointer',
                  background: row.original.status === 'Delete' ? '#d88' : '',
                  padding: 0,
                  margin: 0,
                  minHeight: 0,
                }
              })}


            />
          </>
        )}
      </PageSection>
    </>
  );
}
