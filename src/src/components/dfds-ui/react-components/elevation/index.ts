import { css } from '@emotion/react'

// The values are from material-ui
// https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/styles/shadows.js

type Level = 3 | 8 | 16

const elevation = (level: Level) => {
  switch (level) {
    case 3:
      return css`
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
          0px 3px 1px -2px rgba(0, 0, 0, 0.12);
      `

    case 8:
      return css`
        box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
          0px 3px 14px 2px rgba(0, 0, 0, 0.12);
      `

    case 16:
      return css`
        box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14),
          0px 6px 30px 5px rgba(0, 0, 0, 0.12);
      `

    default:
      throw new Error(`Unsupported elevation level: ${level}`)
  }
}

export default elevation
