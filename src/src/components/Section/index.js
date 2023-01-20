import React from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';

export default function Section({title, children}) {
    return <>
        <Text styledAs='sectionHeadline'>{title}</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {children}
                <br />
            </CardContent>
        </Card>
    </>
}