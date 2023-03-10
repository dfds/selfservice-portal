import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Switch  } from '@dfds-ui/react-components';
import styles from "./MessageContract.module.css";
import SyntaxHighlighter from 'react-syntax-highlighter';
import Expandable from "components/Expandable";
import Poles from "components/Poles";
import { Divider } from "@dfds-ui/react-components/divider";

function MessageHeader({messageType, isOpen}) {
    return <div className={`${styles.header} ${isOpen ? styles.headerselected : null}`}>
        <Text styledAs={isOpen ? "bodyInterfaceBold" : "bodyInterface"}>{messageType}</Text>
    </div>
}

function JsonViewer({json}) {
    return <div className={styles.messagecontent}>
        <SyntaxHighlighter language="json" customStyle={{ backgroundColor: "#fff", padding: "0" }}>{json}</SyntaxHighlighter>
    </div>
}

export default function Message({id, messageType, description, example, schema, isSelected, onHeaderClicked}) {

    const [showSchema, setShowSchema] = useState(false);

    useEffect(() => {
        setShowSchema(false);
    }, [id, isSelected]);

    const handleToggleSchema = () => {
        setShowSchema(prev => !prev);
    };

    const headerClickHandler = () => {
        if (onHeaderClicked) {
            onHeaderClicked(id);
        }
    };

    const header = <>
        <MessageHeader
            messageType={messageType}
            isOpen={isSelected}
        />
        <Divider />
    </>;

    let descriptionElement = <Text>{description}</Text>;
    if ((description || "") === "") {
        descriptionElement = <Text>
            <i style={{color: "#999"}}>[description is missing] </i>
        </Text>;
    }

    return <div className={styles.container}>
        <Expandable header={header} isOpen={isSelected} onHeaderClicked={headerClickHandler}>
            <div className={styles.contentcontainer}>
                <Poles 
                    leftContent={<Text styledAs="label" style={{ marginBottom: "0"}}>Description</Text>}
                    rightContent={<Poles
                        leftContent={<Text styledAs="caption">Show JSON Schema &nbsp;</Text>}
                        rightContent={<Switch size="small" checked={showSchema} onChange={handleToggleSchema} />}
                    />}
                />
                {descriptionElement}

                <br />
                <Text styledAs="label">{showSchema ? "Schema" : "Example"}</Text>
                <JsonViewer json={showSchema ? schema : example} />
            </div>
        </Expandable>
   </div>
}