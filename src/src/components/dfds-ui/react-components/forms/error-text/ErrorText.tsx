import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '@dfds-ui/theme'

const ErrorText = styled.div<{ small?: boolean }>`
  color: ${theme.colors.status.alert};
  ${(p) =>
    p.small
      ? css`
          font-size: 12px;
          line-height: 15px;
        `
      : css`
          font-size: 16px;
          line-height: 26px;
        `}
`

export default ErrorText
