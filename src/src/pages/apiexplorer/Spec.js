import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall } from '@dfds-ui/react-components'

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Spec({id, spec, service, isSelected, onHeaderClicked}) {
    const [state, setState] = useState(null);

    useEffect(() => {
        if (!isSelected) {
            setState(null);
            return;
        }

        async function fetchData() {
            console.log(spec);
        }

        fetchData();
    }, [isSelected]);


    const clickHandler = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    const content = isSelected && state
        ? <SwaggerUI
            spec={spec}
            supportedSubmitMethods={[]}
            tryItOutEnabled={false}
        />
        : "";

    return <Accordion heading={id} isOpen={isSelected} onToggle={clickHandler}>
        <SwaggerUI
            spec={spec}
            supportedSubmitMethods={[]}
            tryItOutEnabled={false}
        />
    </Accordion>
}