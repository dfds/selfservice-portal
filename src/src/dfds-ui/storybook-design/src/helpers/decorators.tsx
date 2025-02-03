import React from 'react'
import { css } from '@emotion/react'

export const withPadding =
  (space = '16px') =>
  (storyFn: (...args: any) => any) => {
    return (
      <div
        css={css`
          margin: ${space};
        `}
      >
        {storyFn()}
      </div>
    )
  }

export const withBackground =
  (color = 'transparent') =>
  (storyFn: (...args: any) => any) => {
    return (
      <div
        css={css`
          background-color: ${color};
        `}
      >
        {storyFn()}
      </div>
    )
  }

export const withWidth = (width: string) => (storyFn: (...args: any) => any) => {
  return (
    <div
      css={css`
        width: ${width};
        background-color: #eee;
        &::after {
          font-family: Verdana, system-ui, Arial, 'Helvetica Neue', Helvetica, sans-serif;
          padding-top: 4px;
          font-size: 10px;
          content: 'withWidth: ${width}';
          opacity: 0.75;
          display: block;
        }
      `}
    >
      {storyFn()}
    </div>
  )
}
