import React, { useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall } from '@dfds-ui/react-components'
import { TextField as TextareaField } from '@dfds-ui/react-components/forms';

import Message from "./message";

export default function Topic({id, name, partitions, retention, isSelected, messages, onHeaderClicked}) {
    const clickHandler = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    return <Accordion heading={name} isOpen={isSelected} onToggle={clickHandler}>
        {(messages || []).length == 0 && <div>No messages defined...yet!</div>}
        {(messages || []).map(x => <Message key={x.id} {...x} />)}
    </Accordion>
}