import { css } from '@emotion/react'

export function ie11MinHeightFix(minHeight?: string) {
  if (typeof minHeight === 'undefined') {
    return undefined
  }
  return css`
    /* Fix IE11 min-height align-items flexbox bug */
    ${onlyIE`
      &:before {
        content: '';
        height: ${minHeight};
      }`}
  `
}

export function onlyIE(strings: TemplateStringsArray, ...args: any) {
  return css`
    @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
      ${css(strings, ...args)}
    }
  `
}

export function onlyChrome(strings: TemplateStringsArray, ...args: any) {
  return css`
    @supports (-webkit-appearance: none) and (not (overflow: -webkit-marquee)) and (not (-ms-ime-align: auto)) and
      (not (-moz-appearance: none)) {
      ${css(strings, ...args)}
    }
  `
}
