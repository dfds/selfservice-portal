import React from "react";
import styles from "./searchview.module.css";
import { Badge } from '@dfds-ui/react-components';
import HighlightedText from "components/HighlightedText"

export function SearchView({data}) {

    return(
        <div className={styles.searchcontainer}>
            <div className={styles.row}>
                <h3 style= {{color: "#1874bc", fontSize: "1.3em", marginRight: "1rem"}}>{<HighlightedText text={data.name} highlight={data.highlight ? data.highlight : ""} />}</h3>
                <Badge className={styles.badgecluster} style={{ backgroundColor: data.clusterColor }}>{data.kafkaClusterName}</Badge>
            </div>
            <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""} />}</p>
            <div >
                <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
            </div>

        </div>
    )
}