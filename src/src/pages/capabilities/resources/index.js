import React from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { ReactComponent as AwsSvg } from './resourceInfoBadges/aws-logo.svg';
import { ReactComponent as AwsSvgGrey } from './resourceInfoBadges/aws-logo-grey.svg';
import { ReactComponent as K8sSvg } from './resourceInfoBadges/k8s-logo.svg';
import { ReactComponent as K8sSvgGrey } from './resourceInfoBadges/k8s-logo-grey.svg';
import { Badge } from '@dfds-ui/react-components'
import { ChipContainer } from "@dfds-ui/react-components";
import { FlexBox } from "@dfds-ui/react-components/flexbox";

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
                <FlexBox style={{gap: 10}}>
                    <div
                        style={{
                            resize: 'horizontal',
                            //overflow: 'hidden',
                            width: '1.5rem',
                            height: 'auto',
                        }}
                        >
                            <AwsSvg />
                    </div>
                    <Badge>No AWS acount associated to this capability</Badge>
                </FlexBox>
                <FlexBox style={{marginTop: '0.04rem',  gap: 10 }}>
                    <div
                        style={{
                            resize: 'horizontal',
                            //overflow: 'hidden',
                            width: '1.5rem',
                            height: 'auto',

                        }}
                        >
                            <K8sSvg />
                    </div>
                    <Badge>No K8s namespace associated to this capability</Badge>
                </FlexBox>

            </CardContent>
        </Card>
    </>
}