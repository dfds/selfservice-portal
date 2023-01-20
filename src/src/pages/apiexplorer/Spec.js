import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall } from '@dfds-ui/react-components'


export default function Spec({id, service, isSelected, onHeaderClicked}) {
    const [state, setState] = useState(null);

    useEffect(() => {
        if (!isSelected) {
            setState(null);
            return;
        } 

        async function fetchData() {
            const url = window.apiBaseUrl + `/apispecs/${id}`;
            const response = await fetch(url, {mode: "cors"});
            const content = await response.text();

            setState(content);
        }

        fetchData();
    }, [isSelected]);

    const clickHandler = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    return <Accordion heading={service} isOpen={isSelected} onToggle={clickHandler}>
        <div>spec content</div>
        <div>state: {state}</div>
    </Accordion>
}