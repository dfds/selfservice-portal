import React, { useState, useEffect } from "react";
import { Button, H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, Card, CardTitle, CardContent, CardMedia, CardActions } from '@dfds-ui/react-components';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { Spinner } from '@dfds-ui/react-components';

import Section from "./../../components/Section";
import Spec from "./Spec";

export default function ApiExplorerPage() {
    const [specs, setSpecs] = useState([]);

    const selectSpec = (id) => setSpecs(prev => {
        const newState = [...prev];
        newState.forEach(x => {
            if (x.id === id) {
                x.isSelected = !x.isSelected;
            } else {
                x.isSelected = false;
            }
        });

        return newState;
    });

    useEffect(() => {
        async function fetchData() {
            // const url = window.apiBaseUrl + "/apispecs";
            // const response = await fetch(url, { mode: "cors" });
            // const { items } = await response.json();

            // console.log("items: ", items);

            let newUrl = "https://api.hellman.oxygen.dfds.cloud/ce/ascraper/specs"
            const response = await fetch(newUrl, { mode: "cors" });
            let items = await response.json();

            console.log(items);

            let entities = [];

            for (const item in items) {
              var splits = item.split('|');
              var newObj = {
                id: splits[1],
                spec: atob(items[item])
              };

              entities.push(newObj)
            }


            setSpecs(entities);
        }

        fetchData();
    }, []);


    const splash = <CardMedia aspectRatio='3:2' media={
        <img src='https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg' alt="" />
    } />

    return <>
        <br/>
        <br/>

        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Text as={H1} styledAs='heroHeadline'>API Explorer</Text>

                <Card variant="fill" surface="main" size='xl' reverse={true} media={splash}>
                    <CardTitle largeTitle>Information</CardTitle>
                    <CardContent>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                            et dolore magna aliqua. Ut eu sem integer vitae justo eget.
                        </p>
                    </CardContent>
                    <CardActions>
                        <Button size='small'>Add</Button>
                    </CardActions>
                </Card>

                <Section title={"APIs"}>
                    {specs.map(x => <Spec key={x.id} spec={x.spec} {...x} onHeaderClicked={id => selectSpec(id)} />)}
                </Section>

            </Column>
        </Container>

        <br/>
     </>
}