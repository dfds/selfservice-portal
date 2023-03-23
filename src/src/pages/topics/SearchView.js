import React from "react";
import styles from "./topics.module.css";



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
            <h3 style= {{color: "#1874bc", fontSize: "1.3em"}}>{highlightedName(data.name, data.highlight)}</h3>
            <p>{data.description}</p>
            <div >
                <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
                <div style= {{color: "#1874bc"}}>{data.kafkaClusterName}</div>
            </div>

        </div>
    )
}