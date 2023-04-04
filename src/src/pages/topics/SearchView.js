import React from "react";
import styles from "./searchview.module.css";

import { Chip, ChipContainer } from '@dfds-ui/react-components'

import { Badge } from '@dfds-ui/react-components';
import { css } from '@emotion/react';
import HighlightedText from "components/HighlightedText"



export function SearchView({data}) {

    // const highlightedName = (name, highlight) => {
    //     if (!highlight) {
    //         return <>{name}</>
    //     }

    //     const parts = name.split(new RegExp(`(${highlight.searchStr})`, 'gi'));

    //     return <>
    //         <span>{parts.map(part => part.toLowerCase() === highlight.searchStr.toLowerCase() ? <span key= {part} style= {{backgroundColor: "yellow"}}>{part}</span> : part)}</span>
    //     </>
    // };

    const getBadgecolor = (kafkaClusteId) => {
        switch (kafkaClusteId) {
            case 'kc-1':
                return '#ED8800';
            case 'kc-2':
                return '#4caf50';
            default:
                return '#0000le';
        }
        
    };


    return(
        <div className={styles.searchcontainer}>
            <div className={styles.row}>
                <h3 style= {{color: "#1874bc", fontSize: "1.3em", marginRight: "1rem"}}>{<HighlightedText text={data.name} highlight={data.highlight ? data.highlight : ""} />}</h3>
                {/* <Chip mdxType="Chip">
                    {data.kafkaClusterName}
                </Chip> */}
                <Badge className={styles.badgecluster} style={{ backgroundColor: data.clusterColor }}>{data.kafkaClusterName}</Badge>
            </div>
            <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""} />}</p>
            <div >
                <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
                {/* <div style= {{color: "#1874bc"}}>{data.kafkaClusterName}</div> */}
            </div>

        </div>
    )
}