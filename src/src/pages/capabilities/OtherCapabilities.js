import React, { useContext, useEffect, useState } from "react";
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
import styles from "./capabilities.module.css"

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
