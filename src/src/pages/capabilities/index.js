import React, { useContext, useEffect, useState } from "react";
import { Button, H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, Card, CardTitle, CardContent, CardMedia, CardActions } from '@dfds-ui/react-components';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from '@dfds-ui/icons/system';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { SideSheet, SideSheetContent } from '@dfds-ui/react-components'
import { Tooltip, TextField } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';
import styles from "./capabilities.module.css";
import AppContext from "./../../app-context";
import { createCapability } from "../../SelfServiceApiClient";
function MyCapabilities({capabilities}) {
    const items = capabilities || [];

    const navigate = useNavigate();
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

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
    const clickHandler = (id) => navigate(`/capabilities/${id}`);

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
                }
                {items.length === 0 &&
                    <Spinner />
                }
            </CardContent>
        </Card>
    </>
}

function NewCapabilityDialog({openSetter, openToggle, onAddCapabilityClicked}) {
    const handleClose = () => {
        openSetter(false);
    };

    //error banner logic
    //const displayConflictWarning =

    const [conflictWarning, setConflictWarning] = useState(false);

    //form logic
    const emptyValues = {
        name: "",
        description: "",
    };

    const [formData, setFormData] = useState(emptyValues);

    const changeName = (e) => {
        e.preventDefault();
        let newName = e?.target?.value || "";
        newName = newName.replace(/\s+/g, "-");

        setFormData(prev => ({...prev, ...{ name: newName.toLowerCase()}}));
    }

    const changeDescription = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.description;
        setFormData(prev => ({...prev, ...{ description: newValue}}));
    };

    //input validation and handling logic
    const publicPrefix = formData.availability === "public"
        ? "pub."
        : "";

    const capabilityName = formData.name === ""
        ? "<name>"
        : formData.name;

    const fullCapabilityName = `${publicPrefix}.${capabilityName}`;

    const isNameValid = formData.name !== "" &&
        !formData.name.match(/^\s*$/g) &&
        !formData.name.match(/(-|_)$/g) &&
        !formData.name.match(/[^a-zA-Z0-9\-_]/g);

    let nameErrorMessage = "";
    if (formData.name.length > 0 && !isNameValid) {
        nameErrorMessage = 'Allowed characters are a-z, 0-9, "-", "_" and it must not end with "-" or "_".';
    }

    const canAdd = formData.name !== "" && formData.description !== "";

    const handleAddCapabilityClicked = () => {
        if (canAdd){
            if (onAddCapabilityClicked) {
                onAddCapabilityClicked({
                    name: capabilityName,
                    description: formData.description,
                })
                .then((response) => {console.log("res: "+response.status);})
                .catch((err) => console.log(err)); //TODO: change state of something and paint everything in panic-red
            }
        }
    };

    //render part
    return <>
        <SideSheet header={`Add new Capability`} onRequestClose={handleClose} isOpen={openToggle} width="30%" alignSideSheet="right" variant="elevated" backdrop>
        <SideSheetContent>
        <Text as={"label"} styledAs="labelBold">Full Capability name:</Text>
            {/*<Text as={"div"} styledAs="bodyInterface">{fullCapabilityName}</Text> */}

            <br />
            <br />

            <div className={styles.tooltipsection}>
                <div className={styles.tooltip}>
                    <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word Capability name (e.g. foo-bar instead of foo_bar).'>
                        {/* <Information /> */}
                    </Tooltip>
                </div>
                <TextField
                    label="Name"
                    placeholder="Enter name of capability"
                    required
                    value={formData.name}
                    onChange={changeName}
                    errorMessage={nameErrorMessage}
                />
            </div>

            <TextField
                label="Description"
                placeholder="Enter a description"
                required value={formData.description}
                onChange={changeDescription}>
            </TextField>
            <Button size='small' onClick={handleAddCapabilityClicked}>Add</Button>
        </SideSheetContent>
        </SideSheet>
    </>
}

export default function CapabilitiesPage() {
    const { user, myCapabilities, otherCapabilities, reloadOtherCapabilities } = useContext(AppContext);
    const [sideSheetOpen, setSidesheetOpen] = React.useState(false);

    const handleAddClicked= () => {
        if (setSidesheetOpen){
            setSidesheetOpen(true);
        }
    };

    useEffect(() => {
        if (user && user.isAuthenticated) {
            reloadOtherCapabilities();
        }
    }, []);

    const splash = <CardMedia aspectRatio='3:2' media={
        <img src='https://images.pexels.com/photos/2873277/pexels-photo-2873277.jpeg' alt="" />
    } />

    return <>
        <br/>
        <br/>
        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <NewCapabilityDialog openToggle={sideSheetOpen} openSetter={setSidesheetOpen} onAddCapabilityClicked={createCapability}/>
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
                        <Button size='small' onClick={handleAddClicked}>Add</Button>
                    </CardActions>
                </Card>

                <br/>

                <MyCapabilities capabilities={myCapabilities} />

                <br/>

                <OtherCapabilities capabilities={otherCapabilities} />

            </Column>
        </Container>

        <br/>
    </>
}