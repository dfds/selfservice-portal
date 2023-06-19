import React, { useContext } from "react";
import { Text } from '@dfds-ui/typography';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from '@dfds-ui/icons/system';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';
import AppContext from "AppContext";
import PageSection from "components/PageSection";


export default function MyCapabilities() {
    const { myCapabilities, appStatus } = useContext(AppContext);

    const items = myCapabilities || [];
    const isLoading = !appStatus.hasLoadedMyCapabilities;

    const navigate = useNavigate();
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

    return <>
        <PageSection headline={`My Capabilities ${isLoading ? "" : `(${items.length})`}`}>
            { isLoading &&
                <Spinner />
            }

            { !isLoading && items.length === 0 &&
                <Text>Oh no! You have not joined a capability...yet! Knock yourself out with the ones below...</Text>
            }

            { !isLoading && items.length > 0 &&
                <>
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
                                    <Text styledAs="action" as={"div"}>{x.name}</Text>
                                    <Text styledAs="caption" as={"div"}>{x.description}</Text>
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
