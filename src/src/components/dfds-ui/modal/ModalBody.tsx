import styled from '@emotion/styled'
import { theme } from '@/components/dfds-ui/theme'
import { typography } from '../typography'
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
