import React, { useContext, useEffect, useState } from "react";
import { Button, H1, Input } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, Card, CardTitle, CardContent, CardMedia, CardActions } from '@dfds-ui/react-components';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from '@dfds-ui/icons/system';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { SideSheet, SideSheetContent } from '@dfds-ui/react-components'
import { Tooltip, TextField } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';
import styles from "./capabilities.module.css";
import AppContext from "AppContext";
import { createCapability } from "../../SelfServiceApiClient";
import PageSection from "components/PageSection";
import { Search } from '@dfds-ui/icons/system';
import HighlightedText from "components/HighlightedText";
import NewCapabilityDialog from "./NewCapabilityDialog";
import MyCapabilities from "./MyCapabilities";

export default function OtherCapabilities() {
    const { otherCapabilities, appStatus } = useContext(AppContext);

    const [searchInput, setSearchInput] = useState("");
    const [searchResult, setSearchResult] = useState([]);

    const hasSearchInput = searchInput.replace(" ", "") !== "";

    useEffect(() => {
        setSearchResult(otherCapabilities);
    }, [otherCapabilities]);

    useEffect(() => {
        let result = otherCapabilities || [];

        if (hasSearchInput) {
            result = result.filter(x => {
                const nameAndDescription = `${x.name || ""} ${x.description}`;
                const isMatch = nameAndDescription
                    .toLocaleLowerCase()
                    .indexOf(searchInput.toLocaleLowerCase()) > -1;

                return isMatch;
            });
        }

        setSearchResult(result);
    }, [searchInput, otherCapabilities]);

    const items = searchResult;
    const isLoading = !appStatus.hasLoadedOtherCapabilities;

    const navigate = useNavigate();
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    return <>
        <PageSection headline={`Other Capabilities ${isLoading ? "" : `(${items.length})`}`}>
            {isLoading &&
                <Spinner />
            }

            {!isLoading &&
                <>
                    <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
                        <TextField
                            name="basic"
                            placeholder="Find a capability..."
                            icon={<Search />}
                            help="Find a capability..."
                            size="small"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            assistiveText={hasSearchInput ? `Found: ${searchResult.length}` : ""}
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
                            {items.map(x => <TableRow key={x.id} onClick={() => clickHandler(x.id)}>
                                <TableDataCell>
                                    <Text styledAs="action" as={"div"}>
                                        <HighlightedText text={x.name} highlight={searchInput} />
                                    </Text>
                                    <Text styledAs="caption" as={"div"}>
                                        <HighlightedText text={x.description} highlight={searchInput} />
                                    </Text>
                                </TableDataCell>
                                <TableDataCell align="right">
                                    <ChevronRight />
                                </TableDataCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </>
            }
        </PageSection>
    </>
}
