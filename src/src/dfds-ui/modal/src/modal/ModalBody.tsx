import styled from '@emotion/styled'
import { theme } from '@/dfds-ui/theme/src'
import { typography } from '@/dfds-ui/typography/src'
import { css } from '@emotion/react'

export type ModalBodyProps = {
  hasPadding?: boolean
  column?: boolean
}

export const ModalBody = styled.div<ModalBodyProps>`
  ${typography.body}
  ${(p) =>
    p.hasPadding &&
    css`
      flex: 1 1 auto;
      margin: ${theme.spacing.xs} ${theme.spacing.s} 0 ${theme.spacing.s};
      padding-bottom: ${theme.spacing.s};
    `}
  ${(p) =>
    p.column &&
    `
    display: flex;
    flex-direction: column;
  `}
`

export default ModalBody
