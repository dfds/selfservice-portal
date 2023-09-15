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

  return (
    <>
      <PageSection
        headline={`Other Capabilities ${isLoading ? "" : `(${items.length})`}`}
      >
        {isLoading && <Spinner />}

        {!isLoading && (
          <>
            <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
              <TextField
                name="basic"
                placeholder="Find a capability..."
                icon={<Search />}
                help="Find a capability..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                assistiveText={
                  hasSearchInput ? `Found: ${searchResult.length}` : ""
                }
              />
            </div>

            <MaterialReactTable columns={columns} data={otherCapabilities}
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
              }
              }
              enableGlobalFilterModes
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
                },
                variant: 'outlined',
              }}
              enableFilterMatchHighlighting={true}
              enableFullScreenToggle={false}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={false}
              enableTopToolbar={true}
              enableBottomToolbar={false}
              enableColumnActions={false}
              muiTableBodyRowProps={({ row }) => ({
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
              


            />

            <Table isInteractive width={"100%"}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell align="right"></TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((x) => (
                  <TableRow key={x.id} onClick={() => clickHandler(x.id)} className={rowClass(x.status)}>
                    <TableDataCell>
                      <Text styledAs="action" as={"div"}>
                        <HighlightedText
                          text={truncateString(x.name)}
                          highlight={searchInput}
                        />
                      </Text>
                      <Text styledAs="caption" as={"div"}>
                        <HighlightedText
                          text={truncateString(x.name)}
                          highlight={searchInput}
                        />
                      </Text>
                    </TableDataCell>
                    <TableDataCell align="right">
                      <ChevronRight />
                    </TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </PageSection>
    </>
  );
}
