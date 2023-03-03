import React, { useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall, TabPanel, Tab, Tabs, TabsContextProvider } from '@dfds-ui/react-components'
import styles from "./message.module.css";
import SyntaxHighlighter from 'react-syntax-highlighter';

import Expandable from "components/Expandable";

function MessageHeader({messageType, isOpen}) {
    return <div className={styles.header}>
        <Text styledAs="bodyInterface">{messageType}</Text>
    </div>
}

export default function Message({id, messageType, description, example, schema, isSelected, onHeaderClicked}) {
    const clickHandler = () => {
        if (onHeaderClicked) {
            onHeaderClicked(id);
        }
    }

    const [activeTab, setActiveTab] = useState(0);

    let temp = example;
    let temp2 = schema;

    const renderJson = (json) => <SyntaxHighlighter language="json">{json}</SyntaxHighlighter>;

    return <div className={styles.container}>
        <Expandable title={messageType}>
            lala
        </Expandable>
        <br />
        <br />
        <Accordion className={styles.fu} header={<MessageHeader messageType={messageType} isOpen={isSelected}/>} isOpen={isSelected} onToggle={clickHandler}>
            <Card variant="outline" surface="secondary">
                <CardContent>
                    <p>{description}</p>

                    <TabsContextProvider value={{
                        onChange: index => setActiveTab(index),
                        activeTab
                    }}>
                        <Tabs>
                            <Tab index={0}>Example</Tab>
                            <Tab index={1}>Schema</Tab>
                        </Tabs>
                        <TabPanel index={0}>
                            { renderJson(temp) }
                        </TabPanel>
                        <TabPanel index={1}>
                            { renderJson(temp2) }
                        </TabPanel>
                    </TabsContextProvider>

                </CardContent>
            </Card>
        </Accordion>
   </div>
}