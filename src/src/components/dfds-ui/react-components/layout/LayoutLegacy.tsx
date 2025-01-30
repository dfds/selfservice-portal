import React from 'react'

const regular = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Regular.woff2'
const italic = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Italic.woff2'
const bold = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Bold.woff2'
const light = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Light.woff2'

import { Global, css } from '@emotion/react'

type FontDefinition = {
  fontFamily: string
  woff2: string
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800
  fontStyle?: 'normal' | 'italic' | 'oblique'
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}

const DFDS_FONTS: FontDefinition[] = [
  { fontFamily: 'DFDS', woff2: regular, fontWeight: 400 },
  { fontFamily: 'DFDS', woff2: italic, fontWeight: 400, fontStyle: 'italic' },
  { fontFamily: 'DFDS', woff2: bold, fontWeight: 700 },
  { fontFamily: 'DFDS', woff2: light, fontWeight: 300 },
]

function fontFace({
  fontFamily,
  woff2,
  fontWeight = 400,
  fontStyle = 'normal',
  fontDisplay = 'fallback',
}: FontDefinition) {
  return `
  @font-face {
    font-family: ${fontFamily};
    src:url(${woff2}) format('woff2');
    font-weight: ${fontWeight};
    font-style: ${fontStyle};
    font-display: ${fontDisplay};
  }`
}

export const Layout = () => {
  const sty = css`
    ${DFDS_FONTS.reduce((prev, cur) => (prev += fontFace(cur)), '')}

    * {
      font-family: DFDS;
    }
  `
  return <Global styles={sty} />
}
