import React, { useContext, useEffect, useState, useMemo } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "@dfds-ui/icons/system";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableDataCell,
} from "@dfds-ui/react-components";
import { TextField } from "@dfds-ui/react-components";
import { Spinner } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { Search } from "@dfds-ui/icons/system";
import HighlightedText from "components/HighlightedText";
import { useCapabilities } from "hooks/Capabilities";
import styles from "./capabilities.module.css";
import { MaterialReactTable } from 'material-react-table';

export default function OtherCapabilities() {
  const { myCapabilities, appStatus, truncateString } = useContext(AppContext);
  const { capabilities, isLoaded } = useCapabilities();
  const [otherCapabilities, setOtherCapabilities] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const hasSearchInput = searchInput.replace(" ", "") !== "";

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

  useEffect(() => {
    let result = otherCapabilities || [];

    if (hasSearchInput) {
      result = result.filter((c) => {
        const input = searchInput.toLocaleLowerCase()
        const isMatch =
          c.id.toLocaleLowerCase().includes(input) ||
          c.name.toLocaleLowerCase().includes(input) ||
          c.description.toLocaleLowerCase().includes(input)
        return isMatch;
      });
    }

    setSearchResult(result);
  }, [searchInput, otherCapabilities]);

  const items = searchResult;
  const isLoading = !isLoaded;

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  const rowClass = (status) => status === "Deleted" ? styles.deletedRow : '';

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) =>  row.name ,
        header: 'Name',
        size: 350,
        enableColumnFilterModes: true,
        disableFilters: false,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,
        
          
        Cell: ({ cell, renderedCellValue }) => {
          return <div> <Text styledAs="action" as={"div"}>
            {renderedCellValue}
          </Text>
            <Text styledAs="caption" as={"div"}>
              {cell.row.original.description}
            </Text>
          </div>
        }

      },
      {
        accessorFn: (row) => row.id,
        header: 'arrow',
        size: 1,
        enableColumnFilterModes: false,
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ cell }) => {
          return <ChevronRight />
        },
        Header: <div></div> //enable empty header
      },
    ],
    [],
  )

  return (
    <>
      <PageSection
        headline={`Other Capabilities ${isLoading ? "" : `(${items.length})`}`}
      >
        {isLoading && <Spinner />}

        {!isLoading && (
          <>

            <MaterialReactTable columns={columns} data={otherCapabilities}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: '700',
                  fontSize: '16px',
                  fontFamily: 'DFDS',
                  color: '#002b45',
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
              }
              }
              enableGlobalFilterModes= {true}
              initialState={{
                showGlobalFilter: true,
              }}
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
              globalFilterFn="contains" 
              enableFilterMatchHighlighting={true}
              enableFullScreenToggle={false}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter= {true}
              enableTopToolbar={true}
              enableBottomToolbar={false}
              enableColumnActions={false}
              muiTableBodyRowProps2={({ row }) => ({
                onClick: () => {
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
