import { Badge } from '@dfds-ui/react-components'
import { FlexBox } from "@dfds-ui/react-components/flexbox";
import { ReactComponent as AwsSvg } from './aws-logo.svg';
import { ReactComponent as AwsSvgGrey } from './aws-logo-grey.svg';
import { ReactComponent as K8sSvg } from './k8s-logo.svg';
import { ReactComponent as K8sSvgGrey } from './k8s-logo-grey.svg';
import SelectedCapabilityContext from "SelectedCapabilityContext";
import { useContext } from 'react';


export function ResourceInfoBadges({}){
 // if user cannot see: return <> </>
 const capabilityresources = useContext(SelectedCapabilityContext);
 return <>
    <p>{capabilityresources.awsAccount}</p>
    <FlexBox style={{gap: 10}}>
        <div style={{resize: 'horizontal', width: '1.5rem',height: 'auto',}}>
            <AwsSvgGrey />
        </div>
        <Badge>No AWS acount associated to this capability</Badge>
    </FlexBox>
    <FlexBox style={{marginTop: '0.04rem',  gap: 10 }}>
        <div style={{resize: 'horizontal', width: '1.5rem', height: 'auto',}}>
            <K8sSvgGrey />
        </div>
        <Badge>No K8s namespace associated to this capability</Badge>
    </FlexBox>
 </>
}