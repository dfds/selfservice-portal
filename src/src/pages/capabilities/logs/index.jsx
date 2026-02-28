import React from "react";
import { Text } from "@/components/ui/Text";
import { Card, CardContent } from "@/components/ui/card";

export default function Logs() {
  return (
    <>
      <Text styledAs="sectionHeadline">Logs</Text>
      <Card>
        <CardContent>
          <p>Access all logs related to your namespace in:</p>

          <p>
            To access the logs for your namespace in AWS Cloudwatch please
            complete the following steps:
          </p>

          <ol>
            <li>
              Login to the AWS account account: dfds-logs (736359295931) though
              DFDS AWS login page
            </li>
            <li>Access your logs in Cloudwatch</li>
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
