import React from 'react'
import { css } from '@emotion/react'

type PlaceholderProps = { width: number; height: number }

const Placeholder: React.FunctionComponent<PlaceholderProps> = ({ width, height, ...rest }) => {
  return (
    <div
      css={css`
        display: flex;
        margin-left: 0;
        background-image: radial-gradient(circle at 50% 50%, #f8f9f9, #eef0f1);
        color: #b8b8b7;
        text-align: center;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        font-weight: 300;
        width: ${width}px;
        height: ${height}px;
      `}
      {...rest}
    />
  )
}

export default Placeholder
