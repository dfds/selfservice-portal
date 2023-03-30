import React from "react";
import styles from "./topics.module.css";

import { Chip, ChipContainer } from '@dfds-ui/react-components'

import { Badge } from '@dfds-ui/react-components';
import { css } from '@emotion/react';



export function SearchView({data}) {

    const highlightedName = (name, highlight) => {
        if (!highlight) {
            return <>{name}</>
        }

        const parts = name.split(new RegExp(`(${highlight.searchStr})`, 'gi'));

        return <>
            <span>{parts.map(part => part.toLowerCase() === highlight.searchStr.toLowerCase() ? <span style= {{backgroundColor: "yellow"}}>{part}</span> : part)}</span>
        </>
    };


    return(
        <div className={styles.searchcontainer}>
            <div className={styles.row}>
                <h3 style= {{color: "#1874bc", fontSize: "1.3em"}}>{highlightedName(data.name, data.highlight)}</h3>
                {/* <Chip mdxType="Chip">
                    {data.kafkaClusterName}
                </Chip> */}
                <Badge className={styles.badgecluster}>{data.kafkaClusterName}</Badge>
            </div>
            <p>{data.description}</p>
            <div >
                <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
                <div style= {{color: "#1874bc"}}>{data.kafkaClusterName}</div>
            </div>

        </div>
    )
}