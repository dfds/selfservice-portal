import React from "react";

export default function HighlightedText({text, highlight, selectedKafkaTopic}) {
    const matches = text.matchAll(highlight);

    if (matches.length === 0) {
        return <>{text}</>
    }

    let highlightStyle = { backgroundColor: "yellow" };

    if (selectedKafkaTopic) {
        highlightStyle = { backgroundColor: "#b99d0b" };
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((x, i) => {
        if (x.toLocaleLowerCase() === highlight.toLocaleLowerCase()) {
            return <span key={i} style={highlightStyle}>{x}</span>
        } else {
            return <span key={i}>{x}</span>
        }
    });
}