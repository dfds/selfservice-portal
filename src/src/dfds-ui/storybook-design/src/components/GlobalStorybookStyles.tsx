import React from 'react'
import { Global, css } from '@emotion/react'

const GlobalStorybookStyles = () => {
  const styles = css`
    html,
    body {
      font-size: 16px;
      background-color: #fcfcfd;
    }
    /* stylelint-disable */
    .docblock-source {
      border-radius: 0 !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
    }

    .docblock-propstable {
      margin: 16px 0 !important;
      th {
        padding: 6px 13px !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        color: black !important;
        border-radius: 0 !important;
      }
      tr {
        background-color: #fff !important;
      }
      /* tr:nth-of-type(even) {
        background-color: #f8f8f8 !important;
      } */
      tbody {
        box-shadow: none !important;
      }
      td {
        background-color: transparent !important;
        padding: 6px 13px !important;
        border: 0 !important;
        border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
        &:first-of-type {
          span:first-of-type {
            border: 1px solid #eee;
            padding: 3px 5px;
            background-color: #f8f8f8;
            font-family: monospace;
            font-weight: normal;
          }
        }
        &:nth-of-type(2) {
          width: 60%;
          & div:last-of-type {
            span {
              color: #0000ff;
              font-size: 12px;
            }
          }
        }
      }
    }

    /* stylelint-enable */

    .markdown-table {
      border: 1px solid #b0afaf;
      font-size: 14px;

      thead {
        text-align: left;
        font-weight: bold;
      }

      tr:nth-of-type(even) {
        background-color: #f8f8f8;
      }

      td,
      th {
        border: 1px solid #b0afaf;
        padding: 10px;
        code {
          /* stylelint-disable */
          padding: 1px !important;
          /* stylelint-enable */
        }
      }
    }
  `
  return <Global data-test="test-thing" styles={styles} />
}

export default GlobalStorybookStyles
