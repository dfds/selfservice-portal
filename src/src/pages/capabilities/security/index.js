import React, { useContext } from "react"
import { Text } from '@dfds-ui/typography';
import { Yes, No } from '@dfds-ui/icons/system';
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "SelectedCapabilityContext";

import styles from "./summary.module.css";
import { useEffect } from "react";

export default function Security() {
    const { details } = useContext(SelectedCapabilityContext);
  
    return <PageSection headline="Security">
        <div className={styles.container}>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Has PII Data</Text> <Yes font-size="2rem" display={details?.containsPII ? "block" : "none"} /> <No font-size="2rem" display={details?.containsPII ? "none" : "block"} /> 
            </div>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Is Critical</Text> <Yes font-size="2rem" display={details?.isCritical ? "block" : "none"} /> <No font-size="2rem" display={details?.isCritical ? "none" : "block"} /> 
            </div>
        </div>
        <br />
    </PageSection>
}