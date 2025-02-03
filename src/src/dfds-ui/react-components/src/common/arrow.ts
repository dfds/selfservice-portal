import { css } from '@emotion/react'

function px(size: number) {
  return `${size}px`
}

// currently limited positions
export type ArrowPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Create css for an arrow
 * A <div> tag must surround {children} to work
 */
export default function arrow(
  size: number,
  color: string,

  offset = 20,
  position: ArrowPosition = 'top-right'
) {
  const degToRad = (x: number) => {
    return (x / 180) * Math.PI
  }
  const calculatedSize = Math.sin(degToRad(45)) * size

  const shadow = 8

  const base = css`
    position: absolute;
    display: inline-block;
    content: '';
    width: 0;
    height: 0;
  `

  return css`
    ::before {
      ${base}
      ${position.includes('top') ? 'bottom' : 'top'}: ${px(-calculatedSize)};
      ${position.includes('left') ? 'left' : 'right'}: ${px(offset)};
      border: ${px(calculatedSize)} solid;
      border-color: ${color} ${color} transparent transparent;
      transform: rotate(-45deg);
      box-shadow: 0 0 ${px(shadow)} 0 rgba(0, 0, 0, 0.12);
      background-color: ${color};
    }

    > div {
      position: relative;
      padding: 5px 0;
      border-radius: 2px;
      background-color: ${color};
      ::before {
        ${base}
        ${position.includes('bottom') &&
        css`
          top: 0;
        `}
        ${position.includes('top') ? 'bottom' : 'top'}: ${px(-calculatedSize)};
        ${position.includes('left') ? 'left' : 'right'}: ${px(offset)};
        border: ${px(calculatedSize)} solid;
        border-color: ${color} ${color} transparent transparent;
        transform: rotate(-45deg);
        pointer-events: none;
      }
    }
  `
}
