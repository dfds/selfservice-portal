import React from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';

export default function Logs({}) {
    return <>
        <Text styledAs='sectionHeadline'>Logs</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                <p>Access all logs related to your namespace in:</p>

<p>
To access the logs for your namespace in AWS Cloudwatch please complete the following steps:
</p>

<ol>
    <li>Login to the AWS account account: dfds-logs (736359295931) though DFDS AWS login page</li>
    <li>Access your logs in Cloudwatch</li>
</ol>

            </CardContent>
        </Card>
    </>
}