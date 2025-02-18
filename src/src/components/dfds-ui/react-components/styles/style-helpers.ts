import { css } from '@emotion/react'

// https://zellwk.com/blog/hide-content-accessibly/
export const visuallyHidden = () => css`
  border: 0;
  clip: rect(0 0 0 0);
  height: auto;
  margin: 0;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
`
