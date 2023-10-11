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
        accessorFn: (row) => { return { name: row.name, description: row.description, status: row.status} },
        header: 'Name',
        size: 350,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => {
          return <div >
            <Text hidden={cell.getValue().status === "Active"}><StatusAlert className={styles.warningIcon} /></Text>
            <Text styledAs="action" style={{ marginLeft: '20px' }} as={"div"}>
              {cell.getValue().name}
            </Text>
            <Text styledAs="caption" style={{ marginLeft: '20px' }} as={"div"}>
              {cell.getValue().description}
            </Text>
          </div>
        }
      },
      {
        accessorFn: (row) => row.id,
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
          return <div>
            <InlineAwsCountSummary data={
              metricsWrapper.getAwsResourcesTotalCountForCapability(cell.getValue())
            } />
          </div>
        }
      },
      {
        accessorFn: (row) => row.id,
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
        accessorFn: (row) => row.id,
        header: 'arrow',
        id: 'details',
        size: 1,
        enableColumnFilterModes: false,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: () => {
          return <ChevronRight />
        },
        Header: <div></div> //enable empty header
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
    console.log(fullTableData);

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
                },
              }}
              muiTablePaperProps={{
                elevation: 0, //change the mui box shadow
                //customize paper styles
                sx: {
                  borderRadius: '0',
                }
              }}
              muiTopToolbarProps={{
                sx: {
                  background: 'none',
                }
                }}
              muiBottomToolbarProps={{
                sx: {
                  background: 'none',
                }
              }}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter= {true}
              enableColumnActions={false}
              muiTableBodyRowProps={({ row }) => {

                return ({
                  onClick: () => {
                    clickHandler(row.original.id)
                  },
                  sx: {
                    cursor: 'pointer',
                    background: row.original.status === 'Deleted' ? '#d88' : '',
                    padding: 0,
                    margin: 0,
                    minHeight: 0,
                    '&:hover td': {
                      backgroundColor: row.original.status === 'Deleted' ? 'rgba(187, 221, 243, 0.1)' : 'rgba(187, 221, 243, 0.4)',
                    },
                  }
                })
              }}


            />
          </>
        )}
      </PageSection>
    </>
  );
}
