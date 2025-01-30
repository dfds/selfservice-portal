import React from 'react'
import { Global, css } from '@emotion/react'

// import regular2 from '@dfds-ui/fonts/fonts/DFDS-Regular.woff2'
// import italic2 from '@dfds-ui/fonts/fonts/DFDS-Italic.woff2'
// import bold2 from '@dfds-ui/fonts/fonts/DFDS-Bold.woff2'
// import light2 from '@dfds-ui/fonts/fonts/DFDS-Light.woff2'

const regular = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Regular.woff2'
const italic = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Italic.woff2'
const bold = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Bold.woff2'
const light = 'https://unpkg.com/@dfds-ui/fonts@0.0.42/fonts/DFDS-Light.woff2'

import { sanitize } from './sanitize'
import { theme } from '@dfds-ui/theme'

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

const dfdsFontFaceRules = () => {
  return DFDS_FONTS.reduce((prev, cur) => (prev += fontFace(cur)), '')
}

export const GlobalStyles = () => {
  const fonts = dfdsFontFaceRules()

  const styles = css`
    ${sanitize}
    ${fonts}

    html {
      margin: 0;
      height: 100%;
      width: 100%;
      font-family: ${theme.fontFamilies.display};
      color: ${theme.colors.text.dark.primary};
      background-color: ${theme.colors.surface.secondary};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-y: scroll;
      overflow-x: hidden;
      box-sizing: border-box;
      text-size-adjust: 100%;
      -ms-overflow-style: scrollbar;
    }

    body {
      margin: 0;
      width: 100%;
      height: 100vh;
    }

    ::selection {
      background-color: ${theme.colors.secondary.main};
      color: #fff;
      text-shadow: none;
    }

    .js-focus-visible :focus:not([data-focus-visible-added]) {
      outline: none;
    }
  `
  return <Global styles={styles} />
}

export const DfdsFontFace = () => {
  const styles = css`
    ${dfdsFontFaceRules()}
  `
  return <Global styles={styles} />
}
