import React from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';

export default function Resources({}) {
    return <>
        <Text styledAs='sectionHeadline'>Resources</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                <p>
                    A capability is the 'container' for your cloud resources. Currently we support 1 AWS Account (sandbox) and 1 
                    Kubernetes namespace per capability. These are not added per default to a capability, but must be requested 
                    by clicking the button below. Note that there is manual processing involved in getting an AWS account 
                    attached so it may take a while before your resources are ready.
                </p>
            </CardContent>
        </Card>
    </>
}