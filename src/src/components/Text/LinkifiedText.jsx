import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:)}\]]+$/;

function splitTrailingPunctuation(token) {
    const punctuationMatch = token.match(TRAILING_PUNCTUATION_REGEX);
    if (!punctuationMatch) {
        return { url: token, trailing: "" };
    }

    const trailing = punctuationMatch[0];
    const url = token.slice(0, -trailing.length);
    return { url, trailing };
}

export default function LinkifiedText({ text, linkClassName, onLinkClick }) {
    if (!text) return null;

    const segments = String(text).split(URL_REGEX);

    return (
        <>
            {segments.map((segment, index) => {
                if (!segment) return null;

                if (!segment.startsWith("http://") && !segment.startsWith("https://")) {
                    return <React.Fragment key={index}>{segment}</React.Fragment>;
                }

                const { url, trailing } = splitTrailingPunctuation(segment);
                if (!url) {
                    return <React.Fragment key={index}>{segment}</React.Fragment>;
                }

                return (
                    <React.Fragment key={index}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClassName}
                            onClick={onLinkClick}
                        >
                            {url}
                        </a>
                        {trailing}
                    </React.Fragment>
                );
            })}
        </>
    );
}