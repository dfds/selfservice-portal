import { css } from '@emotion/react'

export const fadeStyles = css`
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 90%);
  height: calc(7 * 48px);
  margin-top: 49px;
  pointer-events: none;
  position: fixed;
  width: 100vw;
`
