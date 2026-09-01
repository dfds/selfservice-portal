import React from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:)}\]]+$/;

function normalizeText(text) {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "\n");
}

function renderTextWithLineBreaks(text, keyPrefix) {
  return text.split("\n").map((line, index, lines) => (
    <React.Fragment key={`${keyPrefix}-line-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

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

  const normalizedText = normalizeText(text);
  const segments = normalizedText.split(URL_REGEX);

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment) return null;

        if (!segment.startsWith("http://") && !segment.startsWith("https://")) {
          return renderTextWithLineBreaks(segment, `text-${index}`);
        }

        const { url, trailing } = splitTrailingPunctuation(segment);
        if (!url) {
          return renderTextWithLineBreaks(segment, `text-${index}`);
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
