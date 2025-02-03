import { css } from '@emotion/react'

export const sanitize = css`
  *,
  ::before,
  ::after {
    background-repeat: no-repeat; /* 1 */
    box-sizing: inherit; /* 2 */
  }

  ::before,
  ::after {
    text-decoration: inherit; /* 1 */
    vertical-align: inherit; /* 2 */
  }

  figcaption,
  figure,
  main {
    /* 1 */
    display: block;
  }

  hr {
    box-sizing: content-box; /* 1 */
    height: 0; /* 1 */
    overflow: visible; /* 2 */
  }

  a {
    background-color: transparent; /* 1 */
    text-decoration-skip: objects; /* 2 */
  }

  ul {
    list-style: none;
    margin-left: 0;
    margin-right: 0;
  }

  abbr[title] {
    border-bottom: none; /* 1 */
    text-decoration: underline; /* 2 */
    text-decoration: underline dotted; /* 2 */
  }

  b,
  strong {
    font-weight: bolder;
  }

  small {
    font-size: 80%;
  }

  audio,
  canvas,
  iframe,
  img,
  svg,
  video {
    vertical-align: middle;
  }

  audio,
  video {
    display: inline-block;
  }

  img {
    border-style: none;
  }

  svg {
    fill: currentColor;
  }

  svg:not(:root) {
    overflow: visible;
  }

  table {
    border-collapse: collapse;
  }

  button,
  input,
  optgroup,
  select,
  textarea {
    margin: 0;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
    background-color: transparent;
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  select,
  input:not([type='radio']):not([type='checkbox']) {
    appearance: none;
    border-radius: 0;
    box-shadow: none;
  }

  button,
  select {
    /* 1 */
    text-transform: none;
  }

  select {
    box-sizing: border-box;
  }

  textarea {
    overflow: auto;
    resize: vertical;
    border-radius: 0;
  }

  a,
  area,
  button,
  input,
  label,
  select,
  summary,
  textarea,
  [tabindex='0'] {
    touch-action: manipulation;
  }

  button::-moz-focus-inner,
  [type='button']::-moz-focus-inner,
  [type='reset']::-moz-focus-inner,
  [type='submit']::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }

  [hidden] {
    display: none;
  }

  [aria-busy='true'] {
    cursor: progress;
  }

  [aria-controls] {
    cursor: pointer;
  }

  [aria-hidden='false'][hidden]:not(:focus) {
    clip: rect(0, 0, 0, 0);
    display: inherit;
    position: absolute;
  }

  [aria-disabled] {
    cursor: default;
  }
`
