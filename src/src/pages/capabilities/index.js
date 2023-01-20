import React, { useContext, useEffect } from "react";
import { Button, H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, Card, CardTitle, CardContent, CardMedia, CardActions } from '@dfds-ui/react-components';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from '@dfds-ui/icons/system';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';

import AppContext from "./../../app-context";

function MyCapabilities({capabilities}) {
    const items = capabilities || [];

    const navigate = useNavigate();
    const clickHandler = (rootId) => navigate(`/capabilities/${rootId}`);

    return <>
        <Text styledAs='sectionHeadline'>My Capabilities</Text>
        <Card variant="fill"  surface="main">
            <CardContent>
                {items.length > 0 && 
                    <Table isHeaderSticky isInteractive width={"100%"}>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell align="right"></TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(x => <TableRow key={x.id} onClick={() => clickHandler(x.rootId)}>
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
                }                
                {items.length === 0 && 
                    <Text>Oh no! You have not joined a capability...yet! Knock yourself out with the ones below...</Text>
                }
            </CardContent>
        </Card>    
    </>
}

function OtherCapabilities({capabilities}) {
    const items = capabilities || [];

    const navigate = useNavigate();
    const clickHandler = (rootId) => navigate(`/capabilities/${rootId}`);

    return <>
        <Text styledAs='sectionHeadline'>Other Capabilities</Text>
        <Card variant="fill"  surface="main">
            <CardContent>
                {items.length > 0 && 
                    <Table isHeaderSticky isInteractive width={"100%"}>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell align="right"></TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(x => <TableRow key={x.id} onClick={() => clickHandler(x.rootId)}>
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
                }                
                {items.length === 0 && 
                    <Spinner />
                }                
            </CardContent>
        </Card>    
    </>
}

export default function CapabilitiesPage() {
    const { capabilities, reloadCapabilities } = useContext(AppContext);

    useEffect(() => {
        reloadCapabilities();
    }, []);


    
    const splash = <CardMedia aspectRatio='3:2' media={
        <img src='https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg' alt="" />
    } />

    return <>
        <br/>
        <br/>

        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Text as={H1} styledAs='heroHeadline'>Capabilities</Text>

                <Card variant="fill" surface="main" size='xl' reverse={true} media={splash}>
                    <CardTitle largeTitle>Information</CardTitle>
                    <CardContent>
                        <p>
                            Capabilities should be named uniquely after their (business) capability. 
                            Avoid using team or project names. For more information <a href='lala'>head on over to the Playbooks.</a>
                        </p>
                        <p>
                            <strong>Please note:</strong> Capability security is our collective responsibility. <a href="lala">Please visit our security documentation.</a>
                        </p>
                        <p>
                            You can add a new capability by clicking the button below:
                        </p>
                    </CardContent>
                    <CardActions>
                        <Button size='small'>Add</Button>
                    </CardActions>
                </Card>

                <br/>

                <MyCapabilities capabilities={capabilities} />

                <br/>

                <OtherCapabilities capabilities={capabilities} />

            </Column>
        </Container>

        <br/>
    </>
}